import { apiFetch, clientFetch, publicFetch } from "@/lib/api";
import type { FormCreateRequest, FormListResponse, FormPublicResponse, FormResponse, FormSubmitResponse, FormUpdateRequest, ResponseAnswer } from "@/types/form";

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

export async function submitFormResponse(formId: string, answers: ResponseAnswer[]): Promise<FormSubmitResponse> {
  return publicFetch(`/api/v1/forms/${formId}/responses`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}
