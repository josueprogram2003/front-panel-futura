export interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}
