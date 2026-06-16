import { apiFetch, clientFetch } from "@/lib/api";
import type { FormCreateRequest, FormListResponse, FormResponse } from "@/types/form";

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
