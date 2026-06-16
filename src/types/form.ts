export interface FormListResponseData {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FormQuestion {
  id: string;
  text: string;
  answer_type: "text" | "select";
  answer_select_options: string[] | null;
  answer_select_multiple: boolean | null;
  required: boolean;
}

export interface FormCreateRequest {
  title: string;
  description: string;
  questions?: FormQuestion[] | null;
}

export interface FormResponseData {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[] | null;
  is_published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  status_code: number;
  message: string;
  data: FormResponseData;
}

export interface FormListResponse {
  status_code: number;
  message: string;
  data: FormListResponseData[];
}
