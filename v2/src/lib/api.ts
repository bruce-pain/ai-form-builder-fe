const BASE = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail || body.message || `Request failed`);
  }
  return res.json();
}

export function apiFetch(path: string, token?: string, init?: RequestInit) {
  return request(path, {
    ...init,
    headers: token ? { Authorization: `Bearer ${token}`, ...init?.headers } : init?.headers,
  });
}

export function publicFetch(path: string, init?: RequestInit) {
  return request(path, init);
}
