// ============================================================
// components/StatsBar.jsx
// Tarjetas de resumen del inventario
// ============================================================
import styles from './StatsBar.module.css';

export default function StatsBar({ products, categories }) {
  if (!products || !categories) return null;

  // Calculamos estadísticas desde los datos ya cargados (sin otra petición)
  const totalProducts  = products.length;
  const totalStock     = products.reduce((sum, p) => sum + Number(p.stock), 0);
  const lowStock       = products.filter(p => p.stock < 10).length;
  const totalValue     = products.reduce((sum, p) => sum + Number(p.price) * Number(p.stock), 0);

  const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

  const stats = [
    { label: 'Productos',        value: totalProducts,      suffix: '' },
    { label: 'Categorías',       value: categories.length,  suffix: '' },
    { label: 'Stock total',      value: totalStock,          suffix: ' uds.' },
    { label: 'Stock bajo (<10)', value: lowStock,            suffix: '', alert: lowStock > 0 },
    { label: 'Valor inventario', value: fmt(totalValue),    suffix: '', raw: true },
  ];

  return (
    <div className={styles.grid}>
      {stats.map(stat => (
        <div key={stat.label} className={`${styles.card} ${stat.alert ? styles.cardAlert : ''}`}>
          <span className={styles.value}>
            {stat.raw ? stat.value : stat.value + stat.suffix}
          </span>
          <span className={styles.label}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
