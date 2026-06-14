export class AppError extends Error {
  statusCode: number;
  field?: string;

  constructor(message: string, statusCode: number = 400, field?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.field = field;
  }
}
