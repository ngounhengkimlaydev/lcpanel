import { HttpException, HttpStatus } from '@nestjs/common';

export class ResponseValidation extends HttpException {
    constructor(error: Record<string, any>) {
        super(
            {
                statusCode: HttpStatus.FAILED_DEPENDENCY,
                ...error,
            },
            HttpStatus.FAILED_DEPENDENCY,
        );
    }
}
