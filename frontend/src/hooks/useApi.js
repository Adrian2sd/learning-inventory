// ============================================================
// hooks/useApi.js
// Hook personalizado para llamadas a la API
//
// Encapsula el patrón useEffect + fetch + estados de carga/error
// Siguiendo el principio DRY (Don't Repeat Yourself)
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// URL base de la API (vacío = mismo origen; Vite proxy lo redirige al backend)
const API_BASE = import.meta.env.VITE_API_URL || '';

// ------------------------------------------------------------
// Hook: useFetch
// Para peticiones GET que se ejecutan al montar el componente
// ------------------------------------------------------------
export function useFetch(endpoint) {
  const [data,    setData]    = useState(null);    // datos de la respuesta
  const [loading, setLoading] = useState(true);    // estado de carga
  const [error,   setError]   = useState(null);    // mensaje de error si falla

  // useCallback memoriza la función para evitar re-renders innecesarios
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`);

      // fetch no lanza error en status 4xx/5xx, lo hacemos manualmente
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json.data);  // nuestros endpoints devuelven { success, data }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Se ejecuta al montar y cuando cambia el endpoint
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Devolvemos también refetch para poder refrescar manualmente
  return { data, loading, error, refetch: fetchData };
}

// ------------------------------------------------------------
// Función: apiRequest
// Para peticiones POST, PUT, DELETE
// ------------------------------------------------------------
export async function apiRequest(endpoint, method, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }

  return json.data;
}
