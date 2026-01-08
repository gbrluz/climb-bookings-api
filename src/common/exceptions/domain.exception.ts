export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} '${value}' already exists`);
  }
}

export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class BookingConflictException extends DomainException {
  constructor(message: string = 'Booking conflict detected') {
    super(message);
  }
}

export class AuctionException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
