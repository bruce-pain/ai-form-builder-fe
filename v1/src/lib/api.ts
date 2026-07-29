import { auth } from "@/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const session = await auth();

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const error = await res.json();
      if (error.detail) message = error.detail;
    } catch {}
    throw new ApiError(res.status, message);
  }

  return res.json();
}

export async function publicFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const error = await res.json();
      if (error.detail) message = error.detail;
    } catch {}
    throw new ApiError(res.status, message);
  }

  return res.json();
}

export async function clientFetch(path: string, token: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const error = await res.json();
      if (error.detail) message = error.detail;
    } catch {}
    throw new ApiError(res.status, message);
  }

  return res.json();
}
