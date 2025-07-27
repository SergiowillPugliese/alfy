export class BaseResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data?: T, message?: string): BaseResponseDto<T> {
    return new BaseResponseDto(true, data, message);
  }

  static error<T>(error: string, data?: T): BaseResponseDto<T> {
    return new BaseResponseDto(false, data, undefined, error);
  }
}
