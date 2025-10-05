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

        // Jika data adalah array dengan pagination info
        if (data && typeof data === 'object' && 'events' in data && 'total' in data) {
          return ApiResponseDto.paginated(
            data.events || data.data,
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

        // Untuk response sukses biasa
        return ApiResponseDto.success(
          data,
          messageFromMeta || 'Operation completed successfully',
          response.statusCode
        );
      })
    );
  }
} 