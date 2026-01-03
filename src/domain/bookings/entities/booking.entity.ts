import {
  ValidationException,
  BookingConflictException,
} from '../../../common/exceptions/domain.exception';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class Booking {
  private constructor(
    public readonly id: string,
    public readonly courtId: string,
    public readonly userId: string,
    private _startTime: Date,
    private _endTime: Date,
    private _status: BookingStatus,
    private _bookingDate: Date,
    private _price?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id?: string;
    courtId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    status?: BookingStatus;
    bookingDate?: Date;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Booking {
    return new Booking(
      data.id || crypto.randomUUID(),
      data.courtId,
      data.userId,
      data.startTime,
      data.endTime,
      data.status || BookingStatus.PENDING,
      data.bookingDate || new Date(),
      data.price,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    courtId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    bookingDate: Date;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Booking {
    return new Booking(
      data.id,
      data.courtId,
      data.userId,
      data.startTime,
      data.endTime,
      data.status,
      data.bookingDate,
      data.price,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this.courtId) {
      throw new ValidationException('Court ID is required');
    }

    if (!this.userId) {
      throw new ValidationException('User ID is required');
    }

    if (this._endTime <= this._startTime) {
      throw new ValidationException('End time must be after start time');
    }

    const durationMinutes = (this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60);
    if (durationMinutes < 60) {
      throw new ValidationException('Booking duration must be at least 60 minutes');
    }

    if (this._price !== undefined && this._price < 0) {
      throw new ValidationException('Price cannot be negative');
    }
  }

  // Getters
  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date {
    return this._endTime;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get bookingDate(): Date {
    return this._bookingDate;
  }

  get price(): number | undefined {
    return this._price;
  }

  // Business methods
  confirm(): void {
    if (this._status === BookingStatus.CANCELLED) {
      throw new BookingConflictException('Cannot confirm a cancelled booking');
    }
    if (this._status === BookingStatus.COMPLETED) {
      throw new BookingConflictException('Cannot confirm a completed booking');
    }
    this._status = BookingStatus.CONFIRMED;
  }

  cancel(): void {
    if (this._status === BookingStatus.COMPLETED) {
      throw new BookingConflictException('Cannot cancel a completed booking');
    }
    if (this._status === BookingStatus.CANCELLED) {
      throw new BookingConflictException('Booking is already cancelled');
    }
    this._status = BookingStatus.CANCELLED;
  }

  complete(): void {
    if (this._status === BookingStatus.CANCELLED) {
      throw new BookingConflictException('Cannot complete a cancelled booking');
    }
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new BookingConflictException('Only confirmed bookings can be completed');
    }
    this._status = BookingStatus.COMPLETED;
  }

  setPrice(price: number): void {
    if (price < 0) {
      throw new ValidationException('Price cannot be negative');
    }
    this._price = price;
  }

  isActive(): boolean {
    return this._status === BookingStatus.PENDING || this._status === BookingStatus.CONFIRMED;
  }

  isPast(): boolean {
    return this._endTime < new Date();
  }

  isFuture(): boolean {
    return this._startTime > new Date();
  }

  overlaps(other: Booking): boolean {
    return (
      this.courtId === other.courtId &&
      this._startTime < other._endTime &&
      this._endTime > other._startTime
    );
  }

  overlapsWithTimeRange(startTime: Date, endTime: Date): boolean {
    return this._startTime < endTime && this._endTime > startTime;
  }

  getDurationMinutes(): number {
    return (this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60);
  }

  toPlainObject() {
    return {
      id: this.id,
      courtId: this.courtId,
      userId: this.userId,
      startTime: this._startTime,
      endTime: this._endTime,
      status: this._status,
      bookingDate: this._bookingDate,
      price: this._price,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
