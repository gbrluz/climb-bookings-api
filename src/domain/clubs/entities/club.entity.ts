import { ValidationException } from '../../../common/exceptions/domain.exception';

export class Club {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string | null,
    private _name: string,
    private _city: string,
    private _state: string,
    private _address?: string,
    private _phone?: string,
    private _images?: string[],
    private _latitude?: number,
    private _longitude?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id?: string;
    ownerId: string;
    name: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Club {
    return new Club(
      data.id || crypto.randomUUID(),
      data.ownerId,
      data.name,
      data.city,
      data.state,
      data.address,
      data.phone,
      data.images || [],
      data.latitude,
      data.longitude,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    ownerId: string | null;
    name: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Club {
    return new Club(
      data.id,
      data.ownerId,
      data.name,
      data.city,
      data.state,
      data.address,
      data.phone,
      data.images,
      data.latitude,
      data.longitude,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new ValidationException('Club name is required');
    }

    if (!this._city || this._city.trim().length === 0) {
      throw new ValidationException('City is required');
    }

    if (!this._state || this._state.trim().length === 0) {
      throw new ValidationException('State is required');
    }

    // ownerId is optional for legacy data (reconstitute)
    // but required for new clubs (create method validates this)

    if (this._latitude !== undefined && (this._latitude < -90 || this._latitude > 90)) {
      throw new ValidationException('Invalid latitude');
    }

    if (this._longitude !== undefined && (this._longitude < -180 || this._longitude > 180)) {
      throw new ValidationException('Invalid longitude');
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get city(): string {
    return this._city;
  }

  get state(): string {
    return this._state;
  }

  get address(): string | undefined {
    return this._address;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get images(): string[] {
    return this._images || [];
  }

  get latitude(): number | undefined {
    return this._latitude;
  }

  get longitude(): number | undefined {
    return this._longitude;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Club name cannot be empty');
    }
    this._name = name;
  }

  updateLocation(city: string, state: string, address?: string): void {
    if (!city || city.trim().length === 0) {
      throw new ValidationException('City is required');
    }
    if (!state || state.trim().length === 0) {
      throw new ValidationException('State is required');
    }
    this._city = city;
    this._state = state;
    this._address = address;
  }

  updateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new ValidationException('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new ValidationException('Invalid longitude');
    }
    this._latitude = latitude;
    this._longitude = longitude;
  }

  updateContact(phone?: string): void {
    this._phone = phone;
  }

  addImage(imageUrl: string): void {
    if (!this._images) {
      this._images = [];
    }
    this._images.push(imageUrl);
  }

  removeImage(imageUrl: string): void {
    if (this._images) {
      this._images = this._images.filter((img) => img !== imageUrl);
    }
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  hasLocation(): boolean {
    return this._latitude !== undefined && this._longitude !== undefined;
  }

  toPlainObject() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this._name,
      city: this._city,
      state: this._state,
      address: this._address,
      phone: this._phone,
      images: this._images,
      latitude: this._latitude,
      longitude: this._longitude,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
