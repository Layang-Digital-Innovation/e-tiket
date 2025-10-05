export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponseDto<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;

  constructor(success: boolean, data?: T, message?: string, error?: string, statusCode?: number) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
  }

  static success<T>(data?: T, message?: string, statusCode: number = 200): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, data, message, undefined, statusCode);
  }

  static error(error: string, message?: string, statusCode: number = 400): ApiResponseDto<null> {
    return new ApiResponseDto<null>(false, null, message, error, statusCode);
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string,
    statusCode: number = 200
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      data,
      pagination,
      message,
      statusCode,
    };
  }
}