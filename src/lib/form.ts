import { apiFetch } from "@/lib/api";
import type { FormListResponse } from "@/types/form";

export async function getForms(): Promise<FormListResponse> {
  return apiFetch("/api/v1/forms");
}
