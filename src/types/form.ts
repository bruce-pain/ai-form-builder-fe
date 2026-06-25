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
  conversation_id?: string | null;
}

export interface FormUpdateRequest {
  title?: string | null;
  description?: string | null;
  questions?: FormQuestion[] | null;
  is_published?: boolean | null;
}

export interface FormResponseData {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[] | null;
  is_published: boolean;
  conversation_id: string | null;
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

export interface ResponseAnswer {
  question_id: string;
  answer_type: "text" | "select";
  text_answer: string | null;
  select_answer: string[] | null;
}

export interface FormPublicResponseData {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[] | null;
  is_published: boolean;
}

export interface FormPublicResponse {
  status_code: number;
  message: string;
  data: FormPublicResponseData;
}

export interface FormSubmitResponse {
  status_code: number;
  message: string;
  data: Record<string, never>;
}

export interface FormResponseListItem {
  id: string;
  answers: ResponseAnswer[];
  form_id: string;
  created_at: string;
}

export interface FormResponseListResponse {
  status_code: number;
  message: string;
  data: FormResponseListItem[];
}

export interface FormResponseSingleResponse {
  status_code: number;
  message: string;
  data: FormResponseListItem;
}

export interface LLMRequest {
  prompt: string;
  conversation_id?: string | null;
  current_state?: FormQuestionList | null;
}

export interface LLMResponse {
  status_code: number;
  message: string;
  data: FormQuestionList;
  conversation_id: string;
}

export interface FormQuestionList {
  questions: FormQuestion[];
}
