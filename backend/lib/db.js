// ============================================================
// lib/db.js
// Módulo de conexión a Neon PostgreSQL
//
// @neondatabase/serverless usa el protocolo WebSocket de Neon
// que funciona en entornos serverless y Node.js tradicional.
// ============================================================

import { neon } from '@neondatabase/serverless';

// Verificamos que la variable de entorno esté definida
// Si no está, el error aparece al arrancar, no en runtime
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL no está definida. ' +
    'Asegúrate de tener un archivo .env con tu connection string de Neon.'
  );
}

// Creamos el cliente SQL con template literal tagging.
// Uso: await sql`SELECT * FROM products WHERE id = ${id}`
// Los valores interpolados se parametrizan automáticamente → seguro contra SQL injection.
const sql = neon(process.env.DATABASE_URL);

export default sql;
