import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Exception filter for handling Prisma Client known request errors.
 *
 * This filter catches `PrismaClientKnownRequestError` exceptions and formats the
 * response based on the specific Prisma error codes.
 *
 * @export
 * @class PrismaClientExceptionFilter
 * @extends {BaseExceptionFilter}
 */

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  /**
   * Handles the Prisma Client exception and formats the error response
   * based on the error code.
   *
   * @param {Prisma.PrismaClientKnownRequestError} exception The Prisma Client error to handle.
   * @param {ArgumentsHost} host The arguments host for accessing request and response objects.
   *
   * @memberof PrismaClientExceptionFilter
   */

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    // Determine the type of Prisma error and map it to an appropriate HTTP status and message
    let statusCode: HttpStatus;

    switch (exception.code) {
      case 'P2002': {
        statusCode = HttpStatus.CONFLICT;
        break;
      }
      case 'P2000': {
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      }
      case 'P2025': {
        statusCode = HttpStatus.NOT_FOUND;
        break;
      }
      case 'P2010': {
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message:
        exception.meta && exception.meta.message
          ? exception.meta.message
          : message,
      error: exception.meta ? exception.meta : {}, // Return `exception.meta` if it exists, otherwise an empty object
    });
  }
}
