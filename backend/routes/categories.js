// ============================================================
// routes/categories.js
// Endpoints para gestionar categorías
// ============================================================

import { Router } from 'express';
import sql from '../lib/db.js';

const router = Router();

// ------------------------------------------------------------
// GET /api/categories
// Devuelve todas las categorías con conteo de productos
// LEFT JOIN para incluir categorías vacías (sin productos)
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const categories = await sql`
      SELECT
        c.id,
        c.name,
        c.description,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `;

    res.json({ success: true, data: categories });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------
// POST /api/categories
// Crea una nueva categoría
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
    }

    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name.trim()}, ${description || null})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result[0] });

  } catch (error) {
    // Error de nombre duplicado (UNIQUE constraint)
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('Error al crear categoría:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
