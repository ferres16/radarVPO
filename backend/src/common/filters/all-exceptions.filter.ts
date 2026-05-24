import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const logPayload: any = {
      path: request.url,
      method: request.method,
      status,
    };

    if (process.env.NODE_ENV !== 'production') {
      // In non-prod include error name and stack for debugging
      if (exception instanceof Error) {
        logPayload.error = exception.name;
        logPayload.stack = exception.stack;
      } else {
        logPayload.error = 'Unknown internal exception';
      }
    } else {
      // In production avoid logging exception messages or stacks (may contain sensitive data)
      logPayload.error = exception instanceof Error ? exception.name : 'InternalException';
      logPayload.message = 'redacted';
    }

    this.logger.error(JSON.stringify(logPayload));

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: payload,
    });
  }
}
