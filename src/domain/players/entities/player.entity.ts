import { ValidationException } from '../../../common/exceptions/domain.exception';

export type Gender = 'male' | 'female' | 'other';
export type PreferredSide = 'left' | 'right' | 'both';
export type Availability = {
  [key: string]: string[];
};

export class Player {
  private constructor(
    public readonly id: string,
    private _fullName: string,
    private _gender: Gender | null,
    private _birthDate: Date | null,
    private _preferredSide: PreferredSide | null,
    private _category: string | null,
    private _state: string | null,
    private _city: string | null,
    private _availability: Availability | null,
    private _photoUrl: string | null,
    private _rankingPoints: number,
    private _totalMatches: number,
    private _totalWins: number,
    private _winRate: string,
    private _isAdmin: boolean,
    private _globalRankingPoints: string,
    private _isProvisional: boolean,
    private _provisionalGamesPlayed: number,
    private _canJoinLeagues: boolean,
    private _captainCount: number,
    private _phone: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id: string;
    fullName: string;
    gender?: Gender | null;
    birthDate?: Date | null;
    preferredSide?: PreferredSide | null;
    category?: string | null;
    state?: string | null;
    city?: string | null;
    availability?: Availability | null;
    photoUrl?: string | null;
    phone?: string | null;
    isAdmin?: boolean;
  }): Player {
    return new Player(
      data.id,
      data.fullName,
      data.gender ?? null,
      data.birthDate ?? null,
      data.preferredSide ?? null,
      data.category ?? null,
      data.state ?? null,
      data.city ?? null,
      data.availability ?? null,
      data.photoUrl ?? null,
      0, // ranking_points
      0, // total_matches
      0, // total_wins
      '0.00', // win_rate
      data.isAdmin ?? false,
      '0.0', // global_ranking_points
      true, // is_provisional
      0, // provisional_games_played
      false, // can_join_leagues
      0, // captain_count
      data.phone ?? null,
    );
  }

  static reconstitute(data: {
    id: string;
    fullName: string;
    gender: Gender | null;
    birthDate: Date | null;
    preferredSide: PreferredSide | null;
    category: string | null;
    state: string | null;
    city: string | null;
    availability: Availability | null;
    photoUrl: string | null;
    rankingPoints: number;
    totalMatches: number;
    totalWins: number;
    winRate: string;
    isAdmin: boolean;
    globalRankingPoints: string;
    isProvisional: boolean;
    provisionalGamesPlayed: number;
    canJoinLeagues: boolean;
    captainCount: number;
    phone: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Player {
    return new Player(
      data.id,
      data.fullName,
      data.gender,
      data.birthDate,
      data.preferredSide,
      data.category,
      data.state,
      data.city,
      data.availability,
      data.photoUrl,
      data.rankingPoints,
      data.totalMatches,
      data.totalWins,
      data.winRate,
      data.isAdmin,
      data.globalRankingPoints,
      data.isProvisional,
      data.provisionalGamesPlayed,
      data.canJoinLeagues,
      data.captainCount,
      data.phone,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this.id) {
      throw new ValidationException('Player ID is required');
    }

    if (!this._fullName || this._fullName.trim().length === 0) {
      throw new ValidationException('Full name is required');
    }

    if (this._rankingPoints < 0) {
      throw new ValidationException('Ranking points cannot be negative');
    }

    if (this._totalMatches < 0) {
      throw new ValidationException('Total matches cannot be negative');
    }

    if (this._totalWins < 0) {
      throw new ValidationException('Total wins cannot be negative');
    }
  }

  // Getters
  get fullName(): string {
    return this._fullName;
  }

  get gender(): Gender | null {
    return this._gender;
  }

  get birthDate(): Date | null {
    return this._birthDate;
  }

  get preferredSide(): PreferredSide | null {
    return this._preferredSide;
  }

  get category(): string | null {
    return this._category;
  }

  get state(): string | null {
    return this._state;
  }

  get city(): string | null {
    return this._city;
  }

  get availability(): Availability | null {
    return this._availability;
  }

  get photoUrl(): string | null {
    return this._photoUrl;
  }

  get rankingPoints(): number {
    return this._rankingPoints;
  }

  get totalMatches(): number {
    return this._totalMatches;
  }

  get totalWins(): number {
    return this._totalWins;
  }

  get winRate(): string {
    return this._winRate;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get globalRankingPoints(): string {
    return this._globalRankingPoints;
  }

  get isProvisional(): boolean {
    return this._isProvisional;
  }

  get provisionalGamesPlayed(): number {
    return this._provisionalGamesPlayed;
  }

  get canJoinLeagues(): boolean {
    return this._canJoinLeagues;
  }

  get captainCount(): number {
    return this._captainCount;
  }

  get phone(): string | null {
    return this._phone;
  }

  // Business methods
  updateProfile(data: {
    fullName?: string;
    gender?: Gender | null;
    birthDate?: Date | null;
    preferredSide?: PreferredSide | null;
    category?: string | null;
    state?: string | null;
    city?: string | null;
    availability?: Availability | null;
    photoUrl?: string | null;
    phone?: string | null;
  }): void {
    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length === 0) {
        throw new ValidationException('Full name cannot be empty');
      }
      this._fullName = data.fullName;
    }

    if (data.gender !== undefined) {
      this._gender = data.gender;
    }

    if (data.birthDate !== undefined) {
      this._birthDate = data.birthDate;
    }

    if (data.preferredSide !== undefined) {
      this._preferredSide = data.preferredSide;
    }

    if (data.category !== undefined) {
      this._category = data.category;
    }

    if (data.state !== undefined) {
      this._state = data.state;
    }

    if (data.city !== undefined) {
      this._city = data.city;
    }

    if (data.availability !== undefined) {
      this._availability = data.availability;
    }

    if (data.photoUrl !== undefined) {
      this._photoUrl = data.photoUrl;
    }

    if (data.phone !== undefined) {
      this._phone = data.phone;
    }
  }

  updateStats(data: {
    rankingPoints?: number;
    totalMatches?: number;
    totalWins?: number;
    winRate?: string;
    globalRankingPoints?: string;
    isProvisional?: boolean;
    provisionalGamesPlayed?: number;
    canJoinLeagues?: boolean;
  }): void {
    if (data.rankingPoints !== undefined) {
      if (data.rankingPoints < 0) {
        throw new ValidationException('Ranking points cannot be negative');
      }
      this._rankingPoints = data.rankingPoints;
    }

    if (data.totalMatches !== undefined) {
      if (data.totalMatches < 0) {
        throw new ValidationException('Total matches cannot be negative');
      }
      this._totalMatches = data.totalMatches;
    }

    if (data.totalWins !== undefined) {
      if (data.totalWins < 0) {
        throw new ValidationException('Total wins cannot be negative');
      }
      this._totalWins = data.totalWins;
    }

    if (data.winRate !== undefined) {
      this._winRate = data.winRate;
    }

    if (data.globalRankingPoints !== undefined) {
      this._globalRankingPoints = data.globalRankingPoints;
    }

    if (data.isProvisional !== undefined) {
      this._isProvisional = data.isProvisional;
    }

    if (data.provisionalGamesPlayed !== undefined) {
      this._provisionalGamesPlayed = data.provisionalGamesPlayed;
    }

    if (data.canJoinLeagues !== undefined) {
      this._canJoinLeagues = data.canJoinLeagues;
    }
  }

  toPlainObject() {
    return {
      id: this.id,
      full_name: this._fullName,
      gender: this._gender,
      birth_date: this._birthDate,
      preferred_side: this._preferredSide,
      category: this._category,
      state: this._state,
      city: this._city,
      availability: this._availability,
      photo_url: this._photoUrl,
      ranking_points: this._rankingPoints,
      total_matches: this._totalMatches,
      total_wins: this._totalWins,
      win_rate: this._winRate,
      is_admin: this._isAdmin,
      global_ranking_points: this._globalRankingPoints,
      is_provisional: this._isProvisional,
      provisional_games_played: this._provisionalGamesPlayed,
      can_join_leagues: this._canJoinLeagues,
      captain_count: this._captainCount,
      phone: this._phone,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
