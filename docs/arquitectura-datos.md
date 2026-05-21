# Arquitectura de Datos — learning-inventory

## ¿Qué es una Foreign Key y por qué importa?

Una **foreign key** (clave foránea) es una columna en una tabla que **hace referencia a la clave primaria de otra tabla**. Es el mecanismo que crea relaciones entre tablas en una base de datos relacional.

En nuestro proyecto, la columna `category_id` en la tabla `products` es una foreign key que apunta a `id` en `categories`.

```
┌─────────────────────┐         ┌──────────────────────────┐
│      categories     │         │         products          │
├─────────────────────┤         ├──────────────────────────┤
│ id (UUID) ◄─────────┼─────────┤ category_id (UUID) FK    │
│ name                │         │ id (UUID)                 │
│ description         │         │ name                      │
└─────────────────────┘         │ price                     │
                                 │ stock                     │
                                 └──────────────────────────┘
```

### ¿Qué garantiza una foreign key?

1. **Integridad referencial**: No puedes insertar un producto con un `category_id` que no exista en `categories`. La base de datos lo rechaza automáticamente.
2. **Consistencia**: Si eliminas una categoría, la base de datos decide qué hacer con los productos huérfanos según la política configurada.
3. **Normalización**: El nombre de la categoría vive en un solo lugar. Si cambia de "Electrónica" a "Tecnología", solo modificas una fila en `categories`, y todos los productos la reflejan automáticamente.

---

## ON DELETE CASCADE vs ON DELETE RESTRICT

Cuando se intenta hacer `DELETE` sobre una categoría que tiene productos asociados, el motor necesita saber qué hacer. Hay dos estrategias principales:

### ON DELETE CASCADE

```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
```

**Comportamiento**: Al borrar una categoría, **se borran automáticamente todos sus productos**.

**Cuándo usarlo**:
- Cuando los registros hijos no tienen sentido sin el padre (ej: comentarios de una publicación — si la publicación se borra, los comentarios tampoco tienen razón de existir).
- En datos de sesión, logs temporales, o entidades que son "parte de" otra.

**Riesgo**: Un `DELETE` descuidado puede destruir cientos de registros en cascada sin advertencia visible.

---

### ON DELETE RESTRICT

```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
```

**Comportamiento**: **Bloquea el DELETE** si existen productos asociados a esa categoría. La operación falla con un error.

**Cuándo usarlo**:
- Cuando los hijos son entidades independientes que no deberían desaparecer solo porque se borra el padre.
- En inventarios, pedidos, registros financieros — cualquier dato con valor propio.

---

### ✅ ¿Qué comportamiento es más seguro para nuestro proyecto?

**`ON DELETE RESTRICT` es la elección correcta** para un sistema de inventario.

**Razonamiento**:

Un producto tiene valor propio: tiene historial de ventas, precio, stock. Si accidentalmente se borra la categoría "Electrónica", no queremos que 50 productos desaparezcan con ella. `RESTRICT` nos fuerza a tomar una decisión consciente: primero mover los productos a otra categoría, luego borrar la categoría vacía.

Es el principio de **fallo ruidoso**: mejor recibir un error claro que perder datos silenciosamente.

`CASCADE` tiene sentido en relaciones de composición (comentarios → post, items → carrito de compra), no en relaciones de clasificación (producto → categoría).

---

## Diagrama del flujo de datos

```
Cliente HTTP
    │
    ▼
API (Express)
    │
    ├── GET /api/products  ──► SELECT con JOIN ──► Neon PostgreSQL
    │
    └── POST /api/products ──► INSERT parametrizado ──► Neon PostgreSQL
```

## Tecnologías del stack

| Capa           | Tecnología              | Rol                                      |
|----------------|-------------------------|------------------------------------------|
| Base de datos  | PostgreSQL (Neon)       | Persistencia y consultas relacionales    |
| Backend        | Node.js + Express       | API REST, lógica de negocio              |
| Driver DB      | @neondatabase/serverless| Conexión segura a Neon desde Node        |
| Frontend       | React + Vite            | Interfaz de usuario                      |
| Variables env  | dotenv / .env.local     | Gestión segura de credenciales           |
