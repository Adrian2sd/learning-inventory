// ============================================================
// server.js
// Punto de entrada del servidor Express
// ============================================================

// dotenv carga las variables del archivo .env al proceso
// Debe llamarse ANTES de importar cualquier módulo que use process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

// Importamos los routers de cada recurso
import productsRouter    from './routes/products.js';
import categoriesRouter  from './routes/categories.js';

// ── Inicialización ─────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ────────────────────────────────────

// CORS: permite que el frontend (en otro puerto/dominio) haga peticiones
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Puerto de Vite por defecto
}));

// Parsea el body de las peticiones como JSON
app.use(express.json());

// ── Rutas ───────────────────────────────────────────────────
app.use('/api/products',   productsRouter);
app.use('/api/categories', categoriesRouter);

// Ruta de health check — útil para verificar que el servidor responde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.path} no encontrada` });
});

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

// ── Arranque ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Endpoints disponibles:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/categories`);
  console.log(`   - POST /api/categories`);
  console.log(`   - GET  /api/products`);
  console.log(`   - GET  /api/products/:id`);
  console.log(`   - POST /api/products`);
  console.log(`   - PUT  /api/products/:id`);
  console.log(`   - DELETE /api/products/:id`);
});
