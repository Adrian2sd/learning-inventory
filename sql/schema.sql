-- ============================================================
-- schema.sql
-- Definición de la estructura de la base de datos
-- Proyecto: learning-inventory
-- ============================================================

-- Eliminamos las tablas si ya existen (útil al resetear el entorno)
-- El orden importa: primero products (depende de categories), luego categories
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- ============================================================
-- TABLA: categories
-- Almacena las categorías de los productos.
-- Cada categoría tiene un identificador único (UUID), un nombre
-- único y una descripción opcional.
-- ============================================================
CREATE TABLE categories (
  -- UUID como clave primaria (mejor que INTEGER en sistemas distribuidos)
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- El nombre de la categoría debe ser único y no puede estar vacío
  name        VARCHAR(100) UNIQUE NOT NULL,

  -- La descripción es opcional
  description TEXT
);

-- ============================================================
-- TABLA: products
-- Almacena los productos del inventario.
-- Cada producto pertenece a una categoría mediante foreign key.
-- ============================================================
CREATE TABLE products (
  -- UUID como clave primaria
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- El nombre del producto es obligatorio
  name        VARCHAR(150) NOT NULL,

  -- El precio debe ser un decimal preciso y mayor que 0
  -- NUMERIC(10, 2) → hasta 10 dígitos totales, 2 decimales
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),

  -- El stock no puede ser negativo; por defecto arranca en 0
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),

  -- Foreign key: vincula este producto con una categoría existente
  -- Si la categoría se borra, usamos RESTRICT (explicado en docs/)
  category_id UUID NOT NULL,

  -- Registramos cuándo se creó el producto
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Definición explícita del constraint de foreign key
  CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT   -- Protege contra borrado accidental de categorías con productos
);
