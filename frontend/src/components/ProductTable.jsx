// ============================================================
// components/ProductTable.jsx
// Tabla de productos con datos de categorías (JOIN en backend)
// ============================================================

import styles from './ProductTable.module.css';

// Formateamos el precio como moneda
const formatPrice = (price) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

// Badge de stock: verde si hay suficiente, rojo si está bajo
function StockBadge({ stock }) {
  const low = stock < 10;
  return (
    <span className={`${styles.badge} ${low ? styles.badgeLow : styles.badgeOk}`}>
      {stock} uds.
    </span>
  );
}

export default function ProductTable({ products, onDelete, onRefresh }) {
  if (!products || products.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📦</span>
        <p>No hay productos. ¡Añade el primero!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableHeader}>
        <span className={styles.count}>{products.length} productos</span>
        <button className={styles.refreshBtn} onClick={onRefresh} title="Refrescar">
          ↻ Actualizar
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={styles.row}>
                <td className={styles.productName}>{product.name}</td>
                <td>
                  <span className={styles.categoryTag}>{product.category}</span>
                </td>
                <td className={styles.price}>{formatPrice(product.price)}</td>
                <td><StockBadge stock={product.stock} /></td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(product.id, product.name)}
                    title={`Eliminar ${product.name}`}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
