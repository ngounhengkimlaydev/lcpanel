import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function serializeBigInt(value: any): any {
    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (Array.isArray(value)) {
        return value.map(serializeBigInt);
    }

    if (value && typeof value === 'object') {
        if (value instanceof Date) return value;

        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, serializeBigInt(val)]),
        );
    }

    return value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((result) => {
                const safeResult = serializeBigInt(result);

                return {
                    success: true,
                    message: safeResult?.message || 'Request successful',
                    ...safeResult,
                    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                };
            }),
        );
    }
}
