import { ValidationException } from '../../../common/exceptions/domain.exception';

export class Club {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string | null,
    private _name: string,
    private _city: string,
    private _state: string,
    private _openingTime: string, // Format: "HH:mm" (e.g., "08:00")
    private _closingTime: string, // Format: "HH:mm" (e.g., "22:00")
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
    openingTime: string;
    closingTime: string;
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
      data.openingTime,
      data.closingTime,
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
    openingTime: string;
    closingTime: string;
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
      data.openingTime,
      data.closingTime,
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

    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(this._openingTime)) {
      throw new ValidationException('Opening time must be in HH:mm format (e.g., "08:00")');
    }

    if (!timeRegex.test(this._closingTime)) {
      throw new ValidationException('Closing time must be in HH:mm format (e.g., "22:00")');
    }

    // Validate that closing time is after opening time
    const [openHour, openMin] = this._openingTime.split(':').map(Number);
    const [closeHour, closeMin] = this._closingTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (closeMinutes <= openMinutes) {
      throw new ValidationException('Closing time must be after opening time');
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

  get openingTime(): string {
    return this._openingTime;
  }

  get closingTime(): string {
    return this._closingTime;
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

  updateOperatingHours(openingTime: string, closingTime: string): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(openingTime)) {
      throw new ValidationException('Opening time must be in HH:mm format');
    }
    if (!timeRegex.test(closingTime)) {
      throw new ValidationException('Closing time must be in HH:mm format');
    }

    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (closeMinutes <= openMinutes) {
      throw new ValidationException('Closing time must be after opening time');
    }

    this._openingTime = openingTime;
    this._closingTime = closingTime;
  }

  isWithinOperatingHours(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      return false;
    }

    const [hour, min] = time.split(':').map(Number);
    const [openHour, openMin] = this._openingTime.split(':').map(Number);
    const [closeHour, closeMin] = this._closingTime.split(':').map(Number);

    const timeMinutes = hour * 60 + min;
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
  }

  toPlainObject() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this._name,
      city: this._city,
      state: this._state,
      openingTime: this._openingTime,
      closingTime: this._closingTime,
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
