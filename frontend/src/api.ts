import type { Dashboard, Prospect } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Erreur API ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<Dashboard>('/dashboard'),
  prospects: () => request<Prospect[]>('/prospects'),
  simulateMessage: (phone: string, message: string) =>
    request<{ reply: string; prospect: Prospect }>('/simulator/message', {
      method: 'POST',
      body: JSON.stringify({ phone, message })
    })
};
