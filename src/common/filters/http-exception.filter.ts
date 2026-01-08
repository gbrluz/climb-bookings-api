import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException,
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidOperationException,
  UnauthorizedException,
  ValidationException,
  BookingConflictException,
  AuctionException,
} from '../exceptions/domain.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;
      error = exception.name;
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      error = 'Not Found';
    } else if (exception instanceof EntityAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
      error = 'Conflict';
    } else if (exception instanceof BookingConflictException) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
      error = 'Booking Conflict';
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
      error = 'Unauthorized';
    } else if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Validation Error';
    } else if (exception instanceof InvalidOperationException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Invalid Operation';
    } else if (exception instanceof AuctionException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Auction Error';
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Domain Error';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
