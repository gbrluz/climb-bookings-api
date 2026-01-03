import { ValidationException } from '../../../common/exceptions/domain.exception';

export enum SurfaceType {
  CLAY = 'clay',
  SYNTHETIC_GRASS = 'synthetic_grass',
  CONCRETE = 'concrete',
}

export class Court {
  private constructor(
    public readonly id: string,
    public readonly clubId: string,
    private _name: string,
    private _surfaceType: SurfaceType,
    private _isIndoor: boolean,
    private _basePrice: number,
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
    surfaceType: SurfaceType;
    isIndoor: boolean;
    basePrice: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Court {
    return new Court(
      data.id || crypto.randomUUID(),
      data.clubId,
      data.name,
      data.surfaceType,
      data.isIndoor,
      data.basePrice,
      data.isActive ?? true,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    clubId: string;
    name: string;
    surfaceType: SurfaceType;
    isIndoor: boolean;
    basePrice: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Court {
    return new Court(
      data.id,
      data.clubId,
      data.name,
      data.surfaceType,
      data.isIndoor,
      data.basePrice,
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

    if (!this.clubId) {
      throw new ValidationException('Club ID is required');
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get surfaceType(): SurfaceType {
    return this._surfaceType;
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

  toPlainObject() {
    return {
      id: this.id,
      clubId: this.clubId,
      name: this._name,
      surfaceType: this._surfaceType,
      isIndoor: this._isIndoor,
      basePrice: this._basePrice,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
