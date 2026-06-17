import { apiFetch, clientFetch, publicFetch, ApiError } from "@/lib/api";
import type { FormCreateRequest, FormListResponse, FormPublicResponse, FormResponse, FormResponseListResponse, FormResponseSingleResponse, FormSubmitResponse, FormUpdateRequest, ResponseAnswer } from "@/types/form";

export async function getForms(): Promise<FormListResponse> {
  return apiFetch("/api/v1/forms");
}

export async function createForm(data: FormCreateRequest): Promise<FormResponse> {
  return apiFetch("/api/v1/forms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createFormClient(token: string, data: FormCreateRequest): Promise<FormResponse> {
  return clientFetch("/api/v1/forms", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFormClient(token: string, id: string): Promise<FormResponse> {
  return clientFetch(`/api/v1/forms/${id}`, token);
}

export async function updateFormClient(token: string, id: string, data: FormUpdateRequest): Promise<FormResponse> {
  return clientFetch(`/api/v1/forms/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getPublicForm(id: string): Promise<FormPublicResponse> {
  return publicFetch(`/api/v1/forms/public/${id}`);
}

export async function deleteFormClient(token: string, id: string): Promise<void> {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/${id}`, {
    method: "DELETE",
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
}

export async function submitFormResponse(formId: string, answers: ResponseAnswer[]): Promise<FormSubmitResponse> {
  return publicFetch(`/api/v1/forms/${formId}/responses`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function getFormResponsesClient(token: string, formId: string): Promise<FormResponseListResponse> {
  return clientFetch(`/api/v1/forms/${formId}/responses`, token);
}

export async function getFormResponseClient(token: string, formId: string, responseId: string): Promise<FormResponseSingleResponse> {
  return clientFetch(`/api/v1/forms/${formId}/responses/${responseId}`, token);
}
