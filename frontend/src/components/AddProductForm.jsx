// ============================================================
// components/AddProductForm.jsx
// Formulario para agregar nuevos productos
// Llama al endpoint POST /api/products con consultas parametrizadas
// ============================================================

import { useState } from 'react';
import { apiRequest } from '../hooks/useApi.js';
import styles from './AddProductForm.module.css';

// Estado inicial del formulario (objeto vacío reutilizable)
const EMPTY_FORM = { name: '', price: '', stock: '0', category_id: '' };

export default function AddProductForm({ categories, onProductAdded }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  // Manejador genérico: actualiza el campo que cambió
  // Evitamos escribir un handler por cada campo
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();  // Prevenimos el submit nativo del browser
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Llamada POST al backend con los datos del formulario
      await apiRequest('/api/products', 'POST', {
        name:        form.name,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock, 10),
        category_id: form.category_id,
      });

      // Limpiamos el formulario y notificamos al padre para refrescar
      setForm(EMPTY_FORM);
      setSuccess(true);
      onProductAdded();  // callback → llama refetch() en el padre

      // Ocultamos el mensaje de éxito tras 3 segundos
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        <span className={styles.icon}>+</span>
        Nuevo producto
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Nombre */}
        <div className={styles.field}>
          <label className={styles.label}>Nombre del producto</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="ej. Laptop Gaming 15&quot;"
            required
          />
        </div>

        {/* Precio y Stock en fila */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Precio (€)</label>
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Stock inicial</label>
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Categoría */}
        <div className={styles.field}>
          <label className={styles.label}>Categoría</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">— Selecciona una categoría —</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.product_count} productos)
              </option>
            ))}
          </select>
        </div>

        {/* Mensajes de error/éxito */}
        {error   && <p className={styles.error}>⚠ {error}</p>}
        {success && <p className={styles.success}>✓ Producto añadido correctamente</p>}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Guardando…' : 'Añadir producto'}
        </button>
      </form>
    </div>
  );
}
