export interface IAPIError {
  status: number;
  message: string;
  stack?: string;
  type?: string;
}
