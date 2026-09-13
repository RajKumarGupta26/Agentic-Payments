const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  getBudget: () => request("/budget"),
  getPayments: () => request("/payments"),
  getAudit: () => request("/audit"),
  getProviders: () => request("/providers"),

  runTask: (payload) =>
    request("/agent/task", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
