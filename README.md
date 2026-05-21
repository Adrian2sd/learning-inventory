# learning-inventory

Sistema de gestión de inventario full-stack construido con PostgreSQL (Neon), Node.js/Express y React.

## Stack tecnológico

| Capa           | Tecnología                     |
|----------------|--------------------------------|
| Base de datos  | PostgreSQL serverless en Neon  |
| Backend        | Node.js + Express              |
| Driver DB      | @neondatabase/serverless       |
| Frontend       | React + Vite                   |
| Despliegue     | Vercel (backend + frontend)    |

## Estructura del proyecto

```
learning-inventory/
├── sql/
│   ├── schema.sql     # DDL: definición de tablas
│   ├── seed.sql       # DML: datos de prueba + operaciones
│   └── queries.sql    # Consultas avanzadas con JOINs y GROUP BY
├── docs/
│   ├── arquitectura-datos.md  # Foreign keys, ON DELETE
│   ├── analisis-sql.md        # INNER JOIN vs LEFT JOIN
│   └── seguridad-db.md        # SQL Injection + parámetros preparados
├── backend/
│   ├── lib/db.js              # Conexión a Neon
│   ├── routes/
│   │   ├── products.js        # CRUD completo de productos
│   │   └── categories.js      # Gestión de categorías
│   ├── server.js              # Punto de entrada Express
│   ├── .env.example           # Variables de entorno de ejemplo
│   └── package.json
└── frontend/
    ├── src/
    │   ├── hooks/useApi.js      # useFetch + apiRequest
    │   ├── components/
    │   │   ├── ProductTable     # Tabla con datos del JOIN
    │   │   ├── AddProductForm   # Formulario POST parametrizado
    │   │   └── StatsBar         # Resumen del inventario
    │   ├── App.jsx              # Componente raíz coordinador
    │   └── main.jsx
    └── package.json
```

## Setup rápido

### 1. Base de datos (Neon)

1. Ve a [neon.tech](https://neon.tech) y crea un proyecto llamado `learning-inventory`
2. En el SQL Editor, ejecuta en orden:
   ```sql
   -- Primero el esquema
   \i sql/schema.sql
   -- Luego los datos de prueba
   \i sql/seed.sql
   ```
3. Copia tu **connection string** (formato `postgresql://...`)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env y pega tu DATABASE_URL de Neon
npm install
npm run dev
```

El servidor arranca en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app arranca en `http://localhost:5173` (el proxy de Vite redirige `/api` al backend)

## Endpoints de la API

| Método | Ruta                  | Descripción                              |
|--------|-----------------------|------------------------------------------|
| GET    | /api/health           | Health check                             |
| GET    | /api/categories       | Lista categorías con conteo de productos |
| POST   | /api/categories       | Crea una categoría                       |
| GET    | /api/products         | Lista productos con nombre de categoría  |
| GET    | /api/products/:id     | Detalle de un producto                   |
| POST   | /api/products         | Crea un producto (parametrizado)         |
| PUT    | /api/products/:id     | Actualiza un producto                    |
| DELETE | /api/products/:id     | Elimina un producto                      |

## Despliegue en Vercel

### Backend
1. Sube `backend/` a GitHub
2. Importa en Vercel → Framework: Other
3. Añade variable de entorno: `DATABASE_URL` con tu connection string de Neon
4. Añade `FRONTEND_URL` con la URL de tu frontend desplegado

### Frontend
1. Sube `frontend/` a GitHub
2. Importa en Vercel → Framework: Vite
3. Añade variable: `VITE_API_URL` con la URL del backend desplegado

## ORM: Drizzle ORM (extensión opcional)

Para proyectos grandes, escribir SQL puro en cada endpoint se vuelve repetitivo y propenso a errores. **Drizzle ORM** resuelve esto con un enfoque *type-safe*:

### Ventajas de usar Drizzle

1. **Autocompletado y validación en tiempo de compilación**: el esquema se define en TypeScript, así que si escribes un nombre de columna incorrecto, el error aparece en el editor, no en producción.

2. **Migraciones automáticas**: `drizzle-kit generate` compara tu esquema actual con la DB y genera los archivos SQL de migración automáticamente.

3. **Consultas expresivas sin magia**: a diferencia de Sequelize/TypeORM, Drizzle genera SQL predecible que puedes leer y debuggear.

4. **Compatibilidad nativa con Neon**: hay un adaptador oficial `drizzle-orm/neon-http`.

### Ejemplo de integración

```typescript
// drizzle/schema.ts
import { pgTable, uuid, varchar, numeric, integer, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).unique().notNull(),
  description: varchar('description', { length: 255 }),
});

export const products = pgTable('products', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       varchar('name', { length: 150 }).notNull(),
  price:      numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock:      integer('stock').default(0),
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt:  timestamp('created_at').defaultNow(),
});
```

```typescript
// Consulta con JOIN — completamente tipada
const result = await db
  .select({
    product:  products.name,
    price:    products.price,
    category: categories.name,
  })
  .from(products)
  .innerJoin(categories, eq(products.categoryId, categories.id));
// result está tipado: { product: string, price: string, category: string }[]
```

La clave es que **el tipo de retorno se infiere automáticamente del esquema**. Si renombras una columna en el esquema y no actualizas las queries, TypeScript lo marca como error antes de ejecutar nada.

---

## Seguridad

Ver `docs/seguridad-db.md` para la explicación completa de SQL Injection y parámetros preparados.

**Resumen**: todos los endpoints usan template literals de `@neondatabase/serverless` que parametrizan automáticamente cualquier valor interpolado. Las credenciales viven en `.env` (excluido de Git).
