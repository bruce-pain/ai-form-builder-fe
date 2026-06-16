export interface FormListResponseData {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FormListResponse {
  status_code: number;
  message: string;
  data: FormListResponseData[];
}
