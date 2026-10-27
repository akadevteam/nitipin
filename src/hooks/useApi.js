// ============================================================
// useApi — Custom Hook untuk Reliable API Calls
// Week 6: Error Handling & Reliable API
// ============================================================
import { useState, useCallback, useRef, useEffect } from 'react';
import { getFriendlyErrorMessage, isConnectionError } from '../services/api';

/**
 * State lengkap untuk satu API request
 * @typedef {Object} ApiState
 * @property {any}     data       — data hasil response
 * @property {boolean} loading    — sedang loading
 * @property {boolean} refreshing — sedang pull-to-refresh
 * @property {Error|null} error   — error terakhir (null jika sukses)
 * @property {string|null} errorMessage — pesan error ramah user
 * @property {boolean} isOffline  — apakah error karena koneksi
 * @property {boolean} success    — apakah request terakhir sukses
 */

/**
 * useApi — hook untuk menjalankan async API call dengan
 * manajemen state loading/error/data yang lengkap.
 *
 * @param {Function} apiFn     — fungsi async yang memanggil API
 * @param {object}   options
 * @param {boolean}  options.immediate   — langsung panggil saat mount (default: false)
 * @param {any}      options.initialData — nilai awal data (default: null)
 * @param {Function} options.onSuccess   — callback jika berhasil: (data) => void
 * @param {Function} options.onError     — callback jika gagal: (error) => void
 *
 * @returns {{ data, loading, refreshing, error, errorMessage, isOffline, success, execute, refresh, reset }}
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   () => api.getBookings(),
 *   { immediate: true }
 * );
 */
export function useApi(apiFn, options = {}) {
  const { immediate = false, initialData = null, onSuccess, onError } = options;

  const [state, setState] = useState({
    data: initialData,
    loading: immediate,
    refreshing: false,
    error: null,
    errorMessage: null,
    isOffline: false,
    success: false,
  });

  // Ref untuk mencegah state update setelah komponen unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  /**
   * Jalankan API call
   * @param {...any} args — argumen yang diteruskan ke apiFn
   */
  const execute = useCallback(async (...args) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      errorMessage: null,
      isOffline: false,
      success: false,
    }));

    try {
      const result = await apiFn(...args);

      if (!isMounted.current) return;

      setState({
        data: result,
        loading: false,
        refreshing: false,
        error: null,
        errorMessage: null,
        isOffline: false,
        success: true,
      });

      onSuccess?.(result);
      return result;

    } catch (err) {
      if (!isMounted.current) return;

      const errorMessage = getFriendlyErrorMessage(err);
      const offline = isConnectionError(err);

      console.warn('[useApi] Error:', err?.name, '-', err?.message);

      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err,
        errorMessage,
        isOffline: offline,
        success: false,
      }));

      onError?.(err);
      throw err; // Re-throw agar caller bisa handle juga jika perlu
    }
  }, [apiFn, onSuccess, onError]);

  /**
   * Pull-to-refresh: sama seperti execute tapi menggunakan flag `refreshing`
   * @param {...any} args
   */
  const refresh = useCallback(async (...args) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      refreshing: true,
      error: null,
      errorMessage: null,
      isOffline: false,
    }));

    try {
      const result = await apiFn(...args);

      if (!isMounted.current) return;

      setState({
        data: result,
        loading: false,
        refreshing: false,
        error: null,
        errorMessage: null,
        isOffline: false,
        success: true,
      });

      onSuccess?.(result);
      return result;

    } catch (err) {
      if (!isMounted.current) return;

      const errorMessage = getFriendlyErrorMessage(err);
      const offline = isConnectionError(err);

      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err,
        errorMessage,
        isOffline: offline,
        success: false,
      }));

      onError?.(err);
    }
  }, [apiFn, onSuccess, onError]);

  /**
   * Reset state ke kondisi awal
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      refreshing: false,
      error: null,
      errorMessage: null,
      isOffline: false,
      success: false,
    });
  }, [initialData]);

  // Auto-execute saat mount (jika `immediate: true`)
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    execute,
    refresh,
    reset,
  };
}

export default useApi;
