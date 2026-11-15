// ============================================================
// TODO SERVICE — REST API ASYNC CLIENT (WEEK 9 PENUGASAN)
// Host API: https://jsonplaceholder.typicode.com
// Operasi Asinkron: GET, POST, PATCH, DELETE + Tri-State & Error Handling
// ============================================================

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';
const DEFAULT_TIMEOUT_MS = 8000;

// Flag simulasi error untuk kebutuhan demonstrasi pengujian try...catch & Alert
let simulateError = false;

export const setSimulateError = (val) => {
  simulateError = Boolean(val);
};

export const getSimulateError = () => simulateError;

/**
 * Fetch wrapper dengan timeout dan integrasi AbortController
 */
async function fetchWithTimeout(url, options = {}, signal = null) {
  if (simulateError) {
    // Simulasi kegagalan koneksi untuk demo try...catch
    await new Promise((resolve) => setTimeout(resolve, 600));
    throw new Error('SIMULASI ERROR: Gagal terhubung ke REST API server (Simulated Network Error)');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // Jika ada signal eksternal dari useEffect, dengarkan pembatalannya
  if (signal) {
    signal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: Status ${response.status} (${response.statusText || 'Gagal'})`);
    }

    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Permintaan timeout / dibatalkan setelah ${DEFAULT_TIMEOUT_MS / 1000} detik`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 01. GET TODOS (Ambil 10 daftar tugas awal dari REST API)
 * Endpoint: GET /todos?_limit=10
 */
export async function getTodos(signal = null) {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}?_limit=10`, { method: 'GET' }, signal);
    const data = await response.json();
    return {
      success: true,
      data,
      source: 'jsonplaceholder',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Gagal memuat data todo dari server',
      data: [],
    };
  }
}

/**
 * 03. CREATE TODO (Menambah tugas baru melalui REST API)
 * Endpoint: POST /todos
 */
export async function createTodo(title, signal = null) {
  if (!title || !title.trim()) {
    throw new Error('Judul tugas tidak boleh kosong');
  }

  const payload = {
    title: title.trim(),
    completed: false,
    userId: 1,
  };

  const response = await fetchWithTimeout(
    BASE_URL,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    signal
  );

  const data = await response.json();
  return {
    success: true,
    data: {
      ...payload,
      id: data.id || Date.now(), // Fallback ID jika mock server mengembalikan ID 201
    },
  };
}

/**
 * 04. UPDATE STATUS TODO (Ubah status selesai / belum selesai)
 * Endpoint: PATCH /todos/:id
 */
export async function updateTodoStatus(id, completed, signal = null) {
  const payload = { completed: Boolean(completed) };

  const response = await fetchWithTimeout(
    `${BASE_URL}/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    signal
  );

  const data = await response.json();
  return {
    success: true,
    data,
  };
}

/**
 * FITUR PLUS: DELETE TODO (Hapus tugas)
 * Endpoint: DELETE /todos/:id
 */
export async function deleteTodo(id, signal = null) {
  const response = await fetchWithTimeout(
    `${BASE_URL}/${id}`,
    {
      method: 'DELETE',
    },
    signal
  );

  return {
    success: true,
    id,
  };
}

/**
 * Preset saran tugas operasional staf penitipan Nitipin
 */
export const NITIPIN_TASK_PRESETS = [
  'Cek fisik & kelengkapan motor B 1234 ABC',
  'Pembersihan slot parkir A-02',
  'Pemeriksaan CCTV & lampu area parkir',
  'Disinfeksi helm & jas hujan customer',
  'Konfirmasi serah terima motor Beat F 5678 XY',
  'Pengecekan tekanan angin ban motor penitipan',
];

