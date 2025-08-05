import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Optional message describing the result', required: false })
  message?: string;

  @ApiProperty({ description: 'The actual data payload', required: false })
  data?: T;

  @ApiProperty({ description: 'Error message if request failed', required: false })
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
