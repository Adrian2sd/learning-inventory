// ============================================================
// App.jsx
// ============================================================

import { useFetch, apiRequest } from './hooks/useApi.js';
import ProductTable from './components/ProductTable.jsx';
import AddProductForm from './components/AddProductForm.jsx';
import StatsBar from './components/StatsBar.jsx';
import styles from './App.module.css';

// 🔥 BASE URL CENTRALIZADA
const BASE_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const {
    data: products,
    loading: loadingProducts,
    error: errorProducts,
    refetch: refetchProducts,
  } = useFetch(`${BASE_URL}/products`);

  const {
    data: categories,
    loading: loadingCategories,
  } = useFetch(`${BASE_URL}/categories`);

  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
      await apiRequest(`${BASE_URL}/products/${id}`, 'DELETE');
      refetchProducts();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  const loading = loadingProducts || loadingCategories;

  return (
    <div className={styles.app}>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.logo}>
              <span className={styles.logoAccent}>▸</span>
              learning-inventory
            </h1>
            <p className={styles.subtitle}>
              Sistema de inventario · PostgreSQL + Express + React
            </p>
          </div>

          <div className={styles.dbBadge}>
            <span className={styles.dbDot}></span>
            Neon PostgreSQL
          </div>
        </div>
      </header>

      <main className={styles.main}>

        {!loading && products && categories && (
          <StatsBar products={products} categories={categories} />
        )}

        <div className={styles.layout}>

          <aside className={styles.sidebar}>
            <AddProductForm
              categories={categories}
              onProductAdded={refetchProducts}
            />
          </aside>

          <section className={styles.content}>

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Inventario</h2>
            </div>

            {loading && (
              <div className={styles.state}>
                <div className={styles.spinner}></div>
                <p>Conectando con la base de datos…</p>
              </div>
            )}

            {errorProducts && !loading && (
              <div className={styles.errorState}>
                <p>⚠ Error al cargar productos</p>
                <code>{errorProducts}</code>
                <p className={styles.hint}>
                  Revisa que el backend esté desplegado en Render
                </p>
              </div>
            )}

            {!loading && !errorProducts && (
              <ProductTable
                products={products}
                onDelete={handleDelete}
                onRefresh={refetchProducts}
              />
            )}

          </section>
        </div>
      </main>
    </div>
  );
}