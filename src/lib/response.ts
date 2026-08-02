import { apiFetch } from "@/lib/api";
import type { components } from "@/lib/api.types";

type FormResponseListResponse = components["schemas"]["FormResponseListResponse"];

export async function getFormResponses(
  token: string,
  formId: string,
): Promise<FormResponseListResponse> {
  return apiFetch(`/api/v1/forms/${formId}/responses`, token);
}
