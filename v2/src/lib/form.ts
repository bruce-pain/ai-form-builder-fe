import { apiFetch, ApiError } from "@/lib/api";
import type { components } from "@/lib/api.types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

type FormCreateRequest = components["schemas"]["FormCreateRequest"];
type FormUpdateRequest = components["schemas"]["FormUpdateRequest"];
type FormListResponse = components["schemas"]["FormListResponse"];
type FormResponse = components["schemas"]["app__features__form__schemas__FormResponse"];
type LLMResponse = components["schemas"]["LLMResponse"];
type LLMFormData = components["schemas"]["FormResponse-Input"];

export async function getForms(token: string): Promise<FormListResponse> {
  return apiFetch("/api/v1/forms", token);
}

export async function createForm(token: string, data: FormCreateRequest): Promise<FormResponse> {
  return apiFetch("/api/v1/forms", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getForm(token: string, id: string): Promise<FormResponse> {
  return apiFetch(`/api/v1/forms/${id}`, token);
}

export async function updateForm(token: string, id: string, data: FormUpdateRequest): Promise<FormResponse> {
  return apiFetch(`/api/v1/forms/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteForm(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/forms/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail || `Request failed`);
  }
}

export async function generateQuestions(
  token: string,
  prompt: string,
  conversationId?: string | null,
  currentState?: LLMFormData | null,
): Promise<LLMResponse> {
  return apiFetch("/api/v1/llm", token, {
    method: "POST",
    body: JSON.stringify({
      prompt,
      conversation_id: conversationId ?? null,
      current_state: currentState ?? null,
    }),
  });
}
