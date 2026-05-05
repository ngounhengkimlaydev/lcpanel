import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => ({
        success: true,
        message: result?.message || 'Request successful',
        ...result, // spread all returned fields (data, total, page, tableSize)
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }))
    );
  }
}