-- ============================================================
-- queries.sql
-- Consultas avanzadas para análisis de datos
-- ============================================================

-- ------------------------------------------------------------
-- QUERY 1: INNER JOIN
-- Devuelve nombre del producto, precio y nombre de su categoría
-- Solo aparecen productos que TIENEN categoría asignada (INNER)
-- ------------------------------------------------------------
SELECT
  p.name        AS producto,
  p.price       AS precio,
  p.stock       AS stock,
  c.name        AS categoria
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.price DESC;


-- ------------------------------------------------------------
-- QUERY 2: GROUP BY + COUNT
-- Devuelve cada categoría con el número de productos que tiene
-- LEFT JOIN para incluir categorías vacías (sin productos)
-- ------------------------------------------------------------
SELECT
  c.name              AS categoria,
  COUNT(p.id)         AS total_productos,
  AVG(p.price)        AS precio_promedio,
  SUM(p.stock)        AS stock_total
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY total_productos DESC;


-- ------------------------------------------------------------
-- QUERY 3: Productos con stock bajo (menos de 20 unidades)
-- Útil para alertas de reposición
-- ------------------------------------------------------------
SELECT
  p.name      AS producto,
  p.stock     AS stock_disponible,
  c.name      AS categoria
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.stock < 20
ORDER BY p.stock ASC;


-- ------------------------------------------------------------
-- QUERY 4: Rango de precios por categoría
-- MIN, MAX y AVG agrupados
-- ------------------------------------------------------------
SELECT
  c.name          AS categoria,
  MIN(p.price)    AS precio_minimo,
  MAX(p.price)    AS precio_maximo,
  ROUND(AVG(p.price), 2) AS precio_promedio
FROM categories c
INNER JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY precio_promedio DESC;
