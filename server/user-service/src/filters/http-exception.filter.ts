import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';

import { Request, Response } from 'express';

/**
 * Exception filter for handling HTTP exceptions in a NestJS application.
 *
 * This filter catches all `HttpException` instances and formats the response
 * with the status code, timestamp, and request path.
 *
 * @export
 * @class HttpExceptionFilter
 * @implements {ExceptionFilter}
 */

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Handles the HTTP exception and formats the error response.
   *
   * @param {HttpException} exception The HTTP exception to handle.
   * @param {ArgumentsHost} host The arguments host for accessing request and response objects.
   *
   * @memberof HttpExceptionFilter
   */

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    // Check if the exception is a BadRequestException
    if (exception instanceof BadRequestException) {
      const responseBody = exceptionResponse as any;

      // Customize the response for validation errors
      response.status(status).json({
        message: 'Validation Error',
        statusCode: status,
        errors: responseBody?.message || [], // Validation errors will be in the `message` field
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // Handle other exceptions
      response.status(status).json({
        message: exception.message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
