// src/types/response.ts
export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: FieldError[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
