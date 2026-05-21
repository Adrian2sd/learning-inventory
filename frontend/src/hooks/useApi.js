// ============================================================
// hooks/useApi.js
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// 🔥 URL base obligatoria (Vercel env)
const API_BASE = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------
// Hook: useFetch
// ------------------------------------------------------------
export function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = await res.json();

      // 👉 Soporta API tipo {data: ...} o respuesta directa
      setData(json.data ?? json);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ------------------------------------------------------------
// apiRequest (POST, PUT, DELETE)
// ------------------------------------------------------------
export async function apiRequest(endpoint, method, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }

  return json.data ?? json;
}