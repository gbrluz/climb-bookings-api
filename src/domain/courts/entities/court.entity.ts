import { ValidationException } from '../../../common/exceptions/domain.exception';

export class Court {
  private constructor(
    public readonly id: string,
    public readonly clubId: string,
    private _name: string,
    private _type: string | null, // Type of court: padel, tenis, areia, etc.
    private _isIndoor: boolean,
    private _basePrice: number,
    private _slotDuration: number, // Duration in minutes (e.g., 60, 90, 120)
    private _isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id?: string;
    clubId: string;
    name: string;
    type?: string | null;
    isIndoor: boolean;
    basePrice: number;
    slotDuration: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Court {
    return new Court(
      data.id || crypto.randomUUID(),
      data.clubId,
      data.name,
      data.type ?? null,
      data.isIndoor,
      data.basePrice,
      data.slotDuration,
      data.isActive ?? true,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    clubId: string;
    name: string;
    type: string | null;
    isIndoor: boolean;
    basePrice: number;
    slotDuration: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Court {
    return new Court(
      data.id,
      data.clubId,
      data.name,
      data.type,
      data.isIndoor,
      data.basePrice,
      data.slotDuration,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new ValidationException('Court name is required');
    }

    if (this._basePrice < 0) {
      throw new ValidationException('Base price cannot be negative');
    }

    if (this._slotDuration <= 0) {
      throw new ValidationException('Slot duration must be greater than 0');
    }

    // Validate that slot duration is a reasonable value (between 30 and 180 minutes)
    if (this._slotDuration < 30 || this._slotDuration > 180) {
      throw new ValidationException('Slot duration must be between 30 and 180 minutes');
    }

    // Validate that slot duration is a multiple of 15 minutes
    if (this._slotDuration % 15 !== 0) {
      throw new ValidationException('Slot duration must be a multiple of 15 minutes');
    }

    if (!this.clubId) {
      throw new ValidationException('Club ID is required');
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get type(): string | null {
    return this._type;
  }

  get isIndoor(): boolean {
    return this._isIndoor;
  }

  get basePrice(): number {
    return this._basePrice;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get slotDuration(): number {
    return this._slotDuration;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Court name cannot be empty');
    }
    this._name = name;
  }

  updatePrice(price: number): void {
    if (price < 0) {
      throw new ValidationException('Price cannot be negative');
    }
    this._basePrice = price;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  canBeBooked(): boolean {
    return this._isActive;
  }

  updateSlotDuration(duration: number): void {
    if (duration <= 0) {
      throw new ValidationException('Slot duration must be greater than 0');
    }
    if (duration < 30 || duration > 180) {
      throw new ValidationException('Slot duration must be between 30 and 180 minutes');
    }
    if (duration % 15 !== 0) {
      throw new ValidationException('Slot duration must be a multiple of 15 minutes');
    }
    this._slotDuration = duration;
  }

  toPlainObject() {
    return {
      id: this.id,
      clubId: this.clubId,
      name: this._name,
      type: this._type,
      isIndoor: this._isIndoor,
      basePrice: this._basePrice,
      slotDuration: this._slotDuration,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
