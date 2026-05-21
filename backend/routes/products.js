// ============================================================
// routes/products.js
// Endpoints para gestionar productos
// ============================================================

import { Router } from 'express';
import sql from '../lib/db.js';

const router = Router();

// ------------------------------------------------------------
// GET /api/products
// Devuelve todos los productos con el nombre de su categoría
// Usa INNER JOIN: solo productos que tienen categoría asignada
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Template literal con @neondatabase/serverless
    // Los valores dentro de ${} se parametrizan automáticamente
    const products = await sql`
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        p.created_at,
        c.name AS category,
        c.id   AS category_id
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ORDER BY c.name ASC, p.name ASC
    `;

    res.json({ success: true, data: products });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------
// GET /api/products/:id
// Devuelve un producto específico por su UUID
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // $1 → el valor de `id` se pasa como parámetro separado (seguro)
    const result = await sql`
      SELECT
        p.id, p.name, p.price, p.stock, p.created_at,
        c.name AS category, c.id AS category_id
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, data: result[0] });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------
// POST /api/products
// Crea un nuevo producto
// Usa consultas parametrizadas para prevenir SQL Injection
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    // Extraemos los campos del body
    const { name, price, stock, category_id } = req.body;

    // --- Validación básica ---
    // Verificamos que los campos obligatorios estén presentes
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ success: false, error: 'El precio debe ser mayor que 0' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, error: 'La categoría es obligatoria' });
    }

    // --- Inserción parametrizada ---
    // Los valores se pasan como ${variable}, no como concatenación de strings
    const result = await sql`
      INSERT INTO products (name, price, stock, category_id)
      VALUES (${name.trim()}, ${Number(price)}, ${Number(stock) || 0}, ${category_id})
      RETURNING *
    `;

    // Devolvemos el producto creado con status 201 (Created)
    res.status(201).json({ success: true, data: result[0] });

  } catch (error) {
    // Detectamos si es un error de foreign key (categoría no existe)
    if (error.code === '23503') {
      return res.status(400).json({ success: false, error: 'La categoría especificada no existe' });
    }
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------
// PUT /api/products/:id
// Actualiza un producto existente
// ------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    const result = await sql`
      UPDATE products
      SET
        name        = ${name.trim()},
        price       = ${Number(price)},
        stock       = ${Number(stock) || 0},
        category_id = ${category_id}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, data: result[0] });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------
// DELETE /api/products/:id
// Elimina un producto por su UUID
// ------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM products
      WHERE id = ${id}
      RETURNING id, name
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, message: `Producto "${result[0].name}" eliminado correctamente` });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
