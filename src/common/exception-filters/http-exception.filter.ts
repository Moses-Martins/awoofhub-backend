import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { APIResponse } from '../types/APIResponse';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const res = exception.getResponse();

        let errorType = 'Error';
        let message = 'An error occurred';

        if (typeof res === 'string') {
            // Case: getResponse returns a string
            message = res;
        } else if (typeof res === 'object') {
            // Case: getResponse returns an object
            message = res['message'] || exception.message;
            errorType = res['error'] || 'Error';
        }

        const body: APIResponse = {
            success: false,
            data: null,
            error: {
                type: errorType,
                statusCode: status,
            },
            message,
        };

        response.status(status).json(body);
    }
}
