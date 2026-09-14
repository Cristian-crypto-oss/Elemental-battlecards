// src/entities/UserEntity.ts
export class UserEntity {
  private readonly _id: number;
  private readonly _username: string;
  private readonly _email: string;
  private readonly _passwordHash: string;

  constructor(id: number, username: string, email: string, passwordHash: string) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._passwordHash = passwordHash;
  }

  get id(): number { return this._id; }
  get username(): string { return this._username; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
}
