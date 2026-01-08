import {
  ValidationException,
  AuctionException,
} from '../../../common/exceptions/domain.exception';

export enum AuctionStatus {
  OPEN = 'open',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export class Auction {
  private constructor(
    public readonly id: string,
    private _playerIds: string[],
    private _city: string,
    private _date: Date,
    private _time: string,
    private _category: string,
    private _status: AuctionStatus,
    private _claimedByClubId?: string,
    private _reservationId?: string,
    private _latitude?: number,
    private _longitude?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id?: string;
    playerIds: string[];
    city: string;
    date: Date;
    time: string;
    category: string;
    status?: AuctionStatus;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Auction {
    return new Auction(
      data.id || crypto.randomUUID(),
      data.playerIds,
      data.city,
      data.date,
      data.time,
      data.category,
      data.status || AuctionStatus.OPEN,
      undefined,
      undefined,
      data.latitude,
      data.longitude,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    playerIds: string[];
    city: string;
    date: Date;
    time: string;
    category: string;
    status: AuctionStatus;
    claimedByClubId?: string;
    reservationId?: string;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Auction {
    return new Auction(
      data.id,
      data.playerIds,
      data.city,
      data.date,
      data.time,
      data.category,
      data.status,
      data.claimedByClubId,
      data.reservationId,
      data.latitude,
      data.longitude,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this._playerIds || this._playerIds.length === 0) {
      throw new ValidationException('At least one player is required');
    }

    if (!this._city || this._city.trim().length === 0) {
      throw new ValidationException('City is required');
    }

    if (!this._date) {
      throw new ValidationException('Date is required');
    }

    if (!this._time || !this._time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      throw new ValidationException('Invalid time format. Use HH:MM');
    }

    if (!this._category || this._category.trim().length === 0) {
      throw new ValidationException('Category is required');
    }

    if (this._latitude !== undefined && (this._latitude < -90 || this._latitude > 90)) {
      throw new ValidationException('Invalid latitude');
    }

    if (this._longitude !== undefined && (this._longitude < -180 || this._longitude > 180)) {
      throw new ValidationException('Invalid longitude');
    }
  }

  // Getters
  get playerIds(): string[] {
    return [...this._playerIds];
  }

  get city(): string {
    return this._city;
  }

  get date(): Date {
    return this._date;
  }

  get time(): string {
    return this._time;
  }

  get category(): string {
    return this._category;
  }

  get status(): AuctionStatus {
    return this._status;
  }

  get claimedByClubId(): string | undefined {
    return this._claimedByClubId;
  }

  get reservationId(): string | undefined {
    return this._reservationId;
  }

  get latitude(): number | undefined {
    return this._latitude;
  }

  get longitude(): number | undefined {
    return this._longitude;
  }

  // Business methods
  claim(clubId: string, reservationId: string): void {
    if (this._status !== AuctionStatus.OPEN) {
      throw new AuctionException('Only open auctions can be claimed');
    }
    this._status = AuctionStatus.CLAIMED;
    this._claimedByClubId = clubId;
    this._reservationId = reservationId;
  }

  expire(): void {
    if (this._status !== AuctionStatus.OPEN) {
      throw new AuctionException('Only open auctions can be expired');
    }
    this._status = AuctionStatus.EXPIRED;
  }

  cancel(): void {
    if (this._status === AuctionStatus.CLAIMED) {
      throw new AuctionException('Cannot cancel a claimed auction');
    }
    if (this._status === AuctionStatus.EXPIRED) {
      throw new AuctionException('Cannot cancel an expired auction');
    }
    this._status = AuctionStatus.CANCELLED;
  }

  isOpen(): boolean {
    return this._status === AuctionStatus.OPEN;
  }

  isClaimed(): boolean {
    return this._status === AuctionStatus.CLAIMED;
  }

  hasLocation(): boolean {
    return this._latitude !== undefined && this._longitude !== undefined;
  }

  addPlayer(playerId: string): void {
    if (this._status !== AuctionStatus.OPEN) {
      throw new AuctionException('Cannot add players to non-open auctions');
    }
    if (this._playerIds.includes(playerId)) {
      throw new ValidationException('Player already in auction');
    }
    this._playerIds.push(playerId);
  }

  removePlayer(playerId: string): void {
    if (this._status !== AuctionStatus.OPEN) {
      throw new AuctionException('Cannot remove players from non-open auctions');
    }
    this._playerIds = this._playerIds.filter((id) => id !== playerId);
    if (this._playerIds.length === 0) {
      throw new ValidationException('Auction must have at least one player');
    }
  }

  getPlayerCount(): number {
    return this._playerIds.length;
  }

  toPlainObject() {
    return {
      id: this.id,
      player_ids: this._playerIds,
      city: this._city,
      date: this._date,
      time: this._time,
      category: this._category,
      status: this._status,
      claimed_by_club_id: this._claimedByClubId,
      reservation_id: this._reservationId,
      latitude: this._latitude,
      longitude: this._longitude,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
