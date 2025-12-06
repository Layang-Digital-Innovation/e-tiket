import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response_message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {

  constructor(private reflector: Reflector) {}

  private isPaginationData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // Check for pagination properties
    const hasTotal = 'total' in data;
    const hasPage = 'page' in data;
    const hasLimit = 'limit' in data;

    // Check if there's an array property (could be users, events, organizers, etc.)
    const arrayProperty = Object.keys(data).find(key => {
      return Array.isArray(data[key]) && key !== 'total' && key !== 'page' && key !== 'limit';
    });

    return hasTotal && hasPage && hasLimit && !!arrayProperty;
  }

  private getArrayProperty(data: any): { property: string; value: any[] } | null {
    const arrayProperty = Object.keys(data).find(key => {
      return Array.isArray(data[key]) && key !== 'total' && key !== 'page' && key !== 'limit';
    });

    if (arrayProperty) {
      return {
        property: arrayProperty,
        value: data[arrayProperty]
      };
    }

    return null;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const messageFromMeta = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler()
    );
    return next.handle().pipe(
      map((data) => {
        // Jika data sudah dalam format ApiResponseDto, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // kalau service return { data, message }
        let extractedMessage: string | null = null;
        let extractedData: any = data;

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data
        ) {
          extractedMessage = data.message;
          extractedData = data.data;
        }

        // Jika data adalah array dengan pagination info (generic detection)
        if (this.isPaginationData(data)) {
          const arrayData = this.getArrayProperty(data);
          if (arrayData) {
            return ApiResponseDto.paginated(
              arrayData.value,
              {
                page: data.page || 1,
                limit: data.limit || 10,
                total: data.total,
                totalPages: Math.ceil(data.total / (data.limit || 10)),
              },
              'Data retrieved successfully',
              response.statusCode
            );
          }
        }

        // Jika extractedData juga memiliki pagination info
        if (this.isPaginationData(extractedData)) {
          const arrayData = this.getArrayProperty(extractedData);
          if (arrayData) {
            return ApiResponseDto.paginated(
              arrayData.value,
              {
                page: extractedData.page || 1,
                limit: extractedData.limit || 10,
                total: extractedData.total,
                totalPages: Math.ceil(extractedData.total / (extractedData.limit || 10)),
              },
              extractedMessage || 'Data retrieved successfully',
              response.statusCode
            );
          }
        }

        // Untuk response sukses biasa
        return ApiResponseDto.success(
          extractedData,
          extractedMessage || messageFromMeta || 'Operation completed successfully',
          response.statusCode
        );
      })
    );
  }
}