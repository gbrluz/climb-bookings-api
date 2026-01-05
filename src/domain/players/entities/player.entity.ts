import { ValidationException } from '../../../common/exceptions/domain.exception';

export class Player {
  private constructor(
    public readonly id: string,
    private _username: string,
    private _fullName: string,
    private _category: string | null,
    private _phone: string | null,
    private _avatarUrl: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(data: {
    id: string; // Auth user ID
    username: string;
    fullName: string;
    category?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Player {
    return new Player(
      data.id,
      data.username,
      data.fullName,
      data.category ?? null,
      data.phone ?? null,
      data.avatarUrl ?? null,
      data.createdAt,
      data.updatedAt,
    );
  }

  static reconstitute(data: {
    id: string;
    username: string;
    fullName: string;
    category: string | null;
    phone: string | null;
    avatarUrl: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Player {
    return new Player(
      data.id,
      data.username,
      data.fullName,
      data.category,
      data.phone,
      data.avatarUrl,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this.id) {
      throw new ValidationException('Player ID is required');
    }

    if (!this._username || this._username.trim().length === 0) {
      throw new ValidationException('Username is required');
    }

    if (!this._fullName || this._fullName.trim().length === 0) {
      throw new ValidationException('Full name is required');
    }

    // Validate username format (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(this._username)) {
      throw new ValidationException(
        'Username can only contain letters, numbers, underscores, and hyphens',
      );
    }
  }

  // Getters
  get username(): string {
    return this._username;
  }

  get fullName(): string {
    return this._fullName;
  }

  get category(): string | null {
    return this._category;
  }

  get phone(): string | null {
    return this._phone;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  // Business methods
  updateProfile(data: {
    fullName?: string;
    category?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  }): void {
    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length === 0) {
        throw new ValidationException('Full name cannot be empty');
      }
      this._fullName = data.fullName;
    }

    if (data.category !== undefined) {
      this._category = data.category;
    }

    if (data.phone !== undefined) {
      this._phone = data.phone;
    }

    if (data.avatarUrl !== undefined) {
      this._avatarUrl = data.avatarUrl;
    }
  }

  updateUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new ValidationException('Username cannot be empty');
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      throw new ValidationException(
        'Username can only contain letters, numbers, underscores, and hyphens',
      );
    }

    this._username = username;
  }

  toPlainObject() {
    return {
      id: this.id,
      username: this._username,
      fullName: this._fullName,
      category: this._category,
      phone: this._phone,
      avatarUrl: this._avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
