// ============================================================
// App.jsx
// Componente raíz de la aplicación
//
// Patrón: este componente es el "coordinador"
//   - Carga los datos con useFetch
//   - Pasa datos y callbacks a los hijos
//   - Los hijos no saben cómo funciona la API
// ============================================================

import { useFetch, apiRequest } from './hooks/useApi.js';
import ProductTable  from './components/ProductTable.jsx';
import AddProductForm from './components/AddProductForm.jsx';
import StatsBar      from './components/StatsBar.jsx';
import styles        from './App.module.css';

export default function App() {
  // useFetch ejecuta GET /api/products al montar el componente
  // y cada vez que llamemos a refetchProducts
  const {
    data:    products,
    loading: loadingProducts,
    error:   errorProducts,
    refetch: refetchProducts,
  } = useFetch('/api/products');

  // Cargamos categorías para el formulario de nuevo producto
  const {
    data:    categories,
    loading: loadingCategories,
  } = useFetch('/api/categories');

  // Handler para eliminar producto — recibe id y nombre para confirmación
  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
      await apiRequest(`/api/products/${id}`, 'DELETE');
      refetchProducts(); // Refrescamos la lista tras borrar
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  const loading = loadingProducts || loadingCategories;

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.logo}>
              <span className={styles.logoAccent}>▸</span>
              learning-inventory
            </h1>
            <p className={styles.subtitle}>Sistema de inventario · PostgreSQL + Express + React</p>
          </div>
          <div className={styles.dbBadge}>
            <span className={styles.dbDot}></span>
            Neon PostgreSQL
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>

        {/* Stats */}
        {!loading && products && categories && (
          <StatsBar products={products} categories={categories} />
        )}

        {/* Layout de dos columnas */}
        <div className={styles.layout}>

          {/* Columna izquierda: formulario */}
          <aside className={styles.sidebar}>
            <AddProductForm
              categories={categories}
              onProductAdded={refetchProducts}
            />
          </aside>

          {/* Columna derecha: tabla */}
          <section className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Inventario</h2>
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className={styles.state}>
                <div className={styles.spinner}></div>
                <p>Conectando con la base de datos…</p>
              </div>
            )}

            {/* Estado de error */}
            {errorProducts && !loading && (
              <div className={styles.errorState}>
                <p>⚠ Error al cargar productos</p>
                <code>{errorProducts}</code>
                <p className={styles.hint}>
                  Asegúrate de que el backend está corriendo en <code>localhost:3001</code>
                </p>
              </div>
            )}

            {/* Tabla de productos */}
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
