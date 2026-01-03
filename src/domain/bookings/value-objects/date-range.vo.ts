import { ValidationException } from '../../../common/exceptions/domain.exception';

export class DateRange {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
  ) {
    this.validate();
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  static fromDateAndDuration(startDate: Date, durationMinutes: number): DateRange {
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    return new DateRange(startDate, endDate);
  }

  private validate(): void {
    if (this._endDate <= this._startDate) {
      throw new ValidationException('End date must be after start date');
    }
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  getDurationMinutes(): number {
    return (this._endDate.getTime() - this._startDate.getTime()) / (1000 * 60);
  }

  getDurationHours(): number {
    return this.getDurationMinutes() / 60;
  }

  overlaps(other: DateRange): boolean {
    return this._startDate < other._endDate && this._endDate > other._startDate;
  }

  contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  isSameDay(date: Date): boolean {
    return (
      this._startDate.getFullYear() === date.getFullYear() &&
      this._startDate.getMonth() === date.getMonth() &&
      this._startDate.getDate() === date.getDate()
    );
  }

  toPlainObject() {
    return {
      startDate: this._startDate,
      endDate: this._endDate,
    };
  }
}
