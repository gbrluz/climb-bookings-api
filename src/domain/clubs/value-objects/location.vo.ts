import { ValidationException } from '../../../common/exceptions/domain.exception';

export class Location {
  private constructor(
    private readonly _latitude: number,
    private readonly _longitude: number,
  ) {
    this.validate();
  }

  static create(latitude: number, longitude: number): Location {
    return new Location(latitude, longitude);
  }

  private validate(): void {
    if (this._latitude < -90 || this._latitude > 90) {
      throw new ValidationException('Invalid latitude. Must be between -90 and 90');
    }
    if (this._longitude < -180 || this._longitude > 180) {
      throw new ValidationException('Invalid longitude. Must be between -180 and 180');
    }
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  // Calculate distance to another location using Haversine formula (in kilometers)
  distanceTo(other: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(other._latitude - this._latitude);
    const dLon = this.toRadians(other._longitude - this._longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this._latitude)) *
        Math.cos(this.toRadians(other._latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isWithinRadius(other: Location, radiusKm: number): boolean {
    return this.distanceTo(other) <= radiusKm;
  }

  toPlainObject() {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }
}
