# Análisis SQL — INNER JOIN vs LEFT JOIN

## Diferencia fundamental

La diferencia entre `INNER JOIN` y `LEFT JOIN` es simple pero crítica: **qué pasa cuando no hay coincidencia**.

---

## INNER JOIN

> "Dame solo las filas donde hay coincidencia en AMBAS tablas."

```sql
SELECT p.name, p.price, c.name AS categoria
FROM products p
INNER JOIN categories c ON p.category_id = c.id;
```

**Si un producto no tiene categoría asignada → no aparece en el resultado.**
**Si una categoría no tiene productos → no aparece en el resultado.**

Solo se muestran registros con pareja confirmada en los dos lados.

### Escenario del mundo real — INNER JOIN

**Sistema de pedidos en un e-commerce.**

Quieres generar la factura de un pedido. Necesitas el nombre del producto Y su precio vigente. Si un producto fue borrado del catálogo (su ID ya no existe), ese ítem de la factura no tiene datos válidos para mostrar — mejor no incluirlo que mostrar datos incompletos.

```sql
-- Solo pedidos donde el producto todavía existe en catálogo
SELECT o.id AS pedido, p.name AS producto, o.quantity, p.price
FROM order_items o
INNER JOIN products p ON o.product_id = p.id;
```

---

## LEFT JOIN

> "Dame TODAS las filas de la tabla izquierda. Si no hay coincidencia en la derecha, rellena con NULL."

```sql
SELECT c.name AS categoria, COUNT(p.id) AS total_productos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;
```

**Si una categoría no tiene productos → aparece igualmente con `total_productos = 0`.**
**Nunca pierdes filas de la tabla "izquierda" (la del FROM).**

### Escenario del mundo real — LEFT JOIN

**Dashboard de administración de categorías.**

Quieres mostrar TODAS las categorías del sistema, incluyendo las que aún no tienen productos asignados (recién creadas o vaciadas). Con INNER JOIN esas categorías desaparecerían del listado, lo que haría imposible saber que existen.

```sql
-- Todas las categorías, aunque estén vacías
SELECT c.name, COUNT(p.id) AS productos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY productos DESC;
```

Resultado esperado:

| categoria     | productos |
|---------------|-----------|
| Electrónica   | 4         |
| Deportes      | 3         |
| Hogar         | 2         |
| Libros        | 3         |
| Alimentación  | 2         |
| **Nueva cat** | **0**     |  ← aparece gracias a LEFT JOIN

---

## Tabla comparativa

| Aspecto                          | INNER JOIN              | LEFT JOIN                    |
|----------------------------------|-------------------------|------------------------------|
| Filas sin pareja                 | Se descartan            | Se incluyen con NULL         |
| Riesgo de perder datos           | Sí (filas izquierda)    | No (izquierda siempre sale)  |
| Caso de uso típico               | Datos completos/válidos | Auditoría, conteos, reportes |
| Efecto en COUNT                  | Cuenta solo coincidentes| Cuenta todos (con NULL → 0)  |

---

## Regla práctica

- ¿Necesitas **todos** los registros de una tabla, aunque no tengan relación? → **LEFT JOIN**
- ¿Solo te interesan registros **con relación confirmada**? → **INNER JOIN**

Cuando construyes reportes o dashboards, casi siempre querrás LEFT JOIN para no ocultar datos. Cuando construyes vistas de detalle o facturas, INNER JOIN garantiza que solo muestras datos completos.
