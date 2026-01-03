import { ValidationException } from '../../../common/exceptions/domain.exception';

export class TimeSlot {
  private constructor(
    private readonly _start: string,
    private readonly _end: string,
    private readonly _available: boolean,
    private readonly _price?: number,
  ) {
    this.validate();
  }

  static create(
    start: string,
    end: string,
    available: boolean,
    price?: number,
  ): TimeSlot {
    return new TimeSlot(start, end, available, price);
  }

  private validate(): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(this._start)) {
      throw new ValidationException('Invalid start time format');
    }
    if (!timeRegex.test(this._end)) {
      throw new ValidationException('Invalid end time format');
    }
    if (this._price !== undefined && this._price < 0) {
      throw new ValidationException('Price cannot be negative');
    }
  }

  get start(): string {
    return this._start;
  }

  get end(): string {
    return this._end;
  }

  get available(): boolean {
    return this._available;
  }

  get price(): number | undefined {
    return this._price;
  }

  toPlainObject() {
    return {
      start: this._start,
      end: this._end,
      available: this._available,
      price: this._price,
    };
  }
}
