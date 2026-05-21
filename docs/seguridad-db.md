# Seguridad en Base de Datos — SQL Injection y Parámetros Preparados

## ¿Qué es una Inyección SQL?

Una **inyección SQL** es una vulnerabilidad donde un atacante introduce código SQL malicioso como parte de la entrada del usuario, y ese código se ejecuta en la base de datos porque fue concatenado directamente en la consulta.

Es consistentemente una de las vulnerabilidades más críticas en aplicaciones web (OWASP Top 10).

---

## Demostración del ataque

### Código vulnerable (NUNCA hacer esto)

```javascript
// routes/products.js — VERSIÓN VULNERABLE ❌
app.get('/api/products/search', async (req, res) => {
  const name = req.query.name; // El usuario controla este valor

  // PELIGRO: concatenación directa de input en SQL
  const query = `SELECT * FROM products WHERE name = '${name}'`;

  const result = await db.query(query);
  res.json(result.rows);
});
```

### El ataque en acción

Un atacante llama a:
```
GET /api/products/search?name=' OR '1'='1
```

La consulta que se ejecuta en la base de datos sería:
```sql
SELECT * FROM products WHERE name = '' OR '1'='1'
```

Como `'1'='1'` siempre es verdadero, **devuelve TODOS los productos**, saltándose el filtro.

Escenarios más destructivos:

```
-- Borrar toda la tabla:
name = '; DROP TABLE products; --

-- Extraer contraseñas de otra tabla:
name = ' UNION SELECT email, password, null, null FROM users --
```

---

## La solución: Consultas Parametrizadas

Con consultas parametrizadas, la **consulta y los datos viajan por canales separados**. El driver nunca mezcla el SQL con el input del usuario. Los datos siempre se tratan como datos, nunca como código.

```javascript
// La consulta define el "molde" con $1, $2 como marcadores
const query = `SELECT * FROM products WHERE name = $1`;

// Los valores viajan aparte, en un array
const values = [req.query.name];

// El driver ensambla de forma segura internamente
const result = await db.query(query, values);
```

Aunque el usuario envíe `'; DROP TABLE products; --`, el driver lo trata como una cadena literal, no como código SQL. La consulta devuelve 0 resultados, sin ejecutar nada peligroso.

---

## Implementación en nuestro proyecto

### lib/db.js — Conexión segura

```javascript
// La DATABASE_URL viene de variables de entorno, nunca hardcodeada
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
export default sql;
```

### Endpoint GET seguro — productos con JOIN

```javascript
// routes/products.js
app.get('/api/products', async (req, res) => {
  // Sin input de usuario → sin riesgo, pero igual usamos el driver correctamente
  const products = await sql`
    SELECT p.id, p.name, p.price, p.stock, c.name AS category
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    ORDER BY c.name, p.name
  `;
  res.json(products);
});
```

### Endpoint POST seguro — inserción parametrizada

```javascript
app.post('/api/products', async (req, res) => {
  // Extraemos los valores del body
  const { name, price, stock, category_id } = req.body;

  // Validación básica antes de llegar a la DB
  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Inserción completamente parametrizada — $1, $2, $3, $4
  const result = await sql`
    INSERT INTO products (name, price, stock, category_id)
    VALUES (${name}, ${price}, ${stock ?? 0}, ${category_id})
    RETURNING *
  `;

  res.status(201).json(result[0]);
});
```

La sintaxis de template literals de `@neondatabase/serverless` **parametriza automáticamente** cualquier valor interpolado con `${}`. Es imposible inyectar SQL por esa vía.

---

## Buenas prácticas adicionales implementadas

| Práctica                        | Implementación                                      |
|---------------------------------|-----------------------------------------------------|
| Variables de entorno            | `DATABASE_URL` en `.env` / `.env.local`             |
| .gitignore                      | `.env` y `.env.local` excluidos del repositorio     |
| Validación de input             | Verificamos campos obligatorios antes de la query   |
| Principio de mínimo privilegio  | El usuario de DB solo tiene permisos SELECT/INSERT  |
| HTTPS                           | Obligatorio en producción (Vercel lo hace por defecto) |
