-- ============================================================
-- seed.sql
-- Datos de prueba para poblar la base de datos
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- ============================================================
-- INSERCIÓN DE CATEGORÍAS
-- ============================================================
INSERT INTO categories (name, description) VALUES
  ('Electrónica',   'Dispositivos tecnológicos y accesorios'),
  ('Hogar',         'Muebles, decoración y utensilios del hogar'),
  ('Deportes',      'Equipamiento y ropa deportiva'),
  ('Libros',        'Libros técnicos, novelas y material educativo'),
  ('Alimentación',  'Productos alimenticios no perecederos');

-- ============================================================
-- INSERCIÓN DE PRODUCTOS
-- Usamos subconsultas para obtener el UUID de cada categoría
-- por su nombre, evitando hardcodear IDs que cambian en cada entorno
-- ============================================================
INSERT INTO products (name, price, stock, category_id) VALUES

  -- Electrónica
  ('Laptop Gaming 15"',       1299.99,  15, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Monitor 27" 4K',           549.00,  30, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Teclado Mecánico RGB',      89.99,  75, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Auriculares Bluetooth',     59.95,  50, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Webcam 1080p',              45.00,  40, (SELECT id FROM categories WHERE name = 'Electrónica')),

  -- Hogar
  ('Silla Ergonómica',         299.00,  20, (SELECT id FROM categories WHERE name = 'Hogar')),
  ('Escritorio de Madera',     189.99,  10, (SELECT id FROM categories WHERE name = 'Hogar')),
  ('Lámpara LED de Escritorio', 34.50,  60, (SELECT id FROM categories WHERE name = 'Hogar')),

  -- Deportes
  ('Bicicleta de Montaña',     499.00,   8, (SELECT id FROM categories WHERE name = 'Deportes')),
  ('Mochila Senderismo 40L',    75.00,  35, (SELECT id FROM categories WHERE name = 'Deportes')),
  ('Zapatillas Running',        95.00,  45, (SELECT id FROM categories WHERE name = 'Deportes')),

  -- Libros
  ('Clean Code - Robert Martin', 38.00, 25, (SELECT id FROM categories WHERE name = 'Libros')),
  ('The Pragmatic Programmer',   42.00, 20, (SELECT id FROM categories WHERE name = 'Libros')),
  ('Diseño de Bases de Datos',   29.99, 30, (SELECT id FROM categories WHERE name = 'Libros')),

  -- Alimentación
  ('Café Arábica 1kg',           18.50, 100, (SELECT id FROM categories WHERE name = 'Alimentación')),
  ('Aceite de Oliva Extra Virgen', 12.75, 80, (SELECT id FROM categories WHERE name = 'Alimentación'));

-- ============================================================
-- OPERACIONES TRANSACCIONALES (simulación de operaciones reales)
-- ============================================================

-- Simular una venta: restar 3 unidades de la Laptop Gaming
UPDATE products
SET stock = stock - 3
WHERE name = 'Laptop Gaming 15"';

-- Aplicar subida de precios del 10% a toda la categoría Electrónica
UPDATE products
SET price = price * 1.10
WHERE category_id = (SELECT id FROM categories WHERE name = 'Electrónica');

-- Eliminar un producto descatalogado (la Webcam, como ejemplo)
DELETE FROM products
WHERE name = 'Webcam 1080p';
