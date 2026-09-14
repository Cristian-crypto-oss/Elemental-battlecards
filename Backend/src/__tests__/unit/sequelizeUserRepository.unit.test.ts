// src/__tests__/unit/sequelizeUserRepository.unit.test.ts
// Validates: Requirements 1.5

import { ModelDefined } from 'sequelize';

import { RegisterDto } from '../../dtos/RegisterDto';
import { UserEntity } from '../../entities/UserEntity';
import { UserAttributes, UserCreationAttributes } from '../../models/user';
import { SequelizeUserRepository } from '../../repositories/SequelizeUserRepository';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal Sequelize model instance mock that returns the given
 * attributes when `.get()` is called on the returned record.
 */
function makeMockRecord(attrs: UserAttributes) {
  return { get: () => attrs };
}

/**
 * Builds a Jest mock that satisfies the shape of
 * `ModelDefined<UserAttributes, UserCreationAttributes>`.
 * Only `findOne` and `create` are needed by `SequelizeUserRepository`.
 */
function buildMockModel(overrides: {
  findOne?: jest.Mock;
  create?: jest.Mock;
}) {
  return {
    findOne: overrides.findOne ?? jest.fn(),
    create: overrides.create ?? jest.fn(),
  } as unknown as ModelDefined<UserAttributes, UserCreationAttributes>;
}

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------

const SAMPLE_ATTRS: UserAttributes = {
  id: 1,
  username: 'ash',
  email: 'ash@example.com',
  password: 'hashed_password',
};

const SAMPLE_REGISTER_DTO: RegisterDto = {
  username: 'ash',
  email: 'ash@example.com',
  password: 'hashed_password',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SequelizeUserRepository', () => {
  // -------------------------------------------------------------------------
  // findByEmail
  // -------------------------------------------------------------------------
  describe('findByEmail', () => {
    it('returns a UserEntity when a record is found', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(makeMockRecord(SAMPLE_ATTRS));
      const repo = new SequelizeUserRepository(buildMockModel({ findOne: mockFindOne }));

      const result = await repo.findByEmail(SAMPLE_ATTRS.email);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe(SAMPLE_ATTRS.id);
      expect(result?.username).toBe(SAMPLE_ATTRS.username);
      expect(result?.email).toBe(SAMPLE_ATTRS.email);
      expect(result?.passwordHash).toBe(SAMPLE_ATTRS.password);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { email: SAMPLE_ATTRS.email } });
    });

    it('returns null when no record is found', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(null);
      const repo = new SequelizeUserRepository(buildMockModel({ findOne: mockFindOne }));

      const result = await repo.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
    });
  });

  // -------------------------------------------------------------------------
  // findByUsername
  // -------------------------------------------------------------------------
  describe('findByUsername', () => {
    it('returns a UserEntity when a record is found', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(makeMockRecord(SAMPLE_ATTRS));
      const repo = new SequelizeUserRepository(buildMockModel({ findOne: mockFindOne }));

      const result = await repo.findByUsername(SAMPLE_ATTRS.username);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe(SAMPLE_ATTRS.id);
      expect(result?.username).toBe(SAMPLE_ATTRS.username);
      expect(result?.email).toBe(SAMPLE_ATTRS.email);
      expect(result?.passwordHash).toBe(SAMPLE_ATTRS.password);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { username: SAMPLE_ATTRS.username } });
    });

    it('returns null when no record is found', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(null);
      const repo = new SequelizeUserRepository(buildMockModel({ findOne: mockFindOne }));

      const result = await repo.findByUsername('ghost');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { username: 'ghost' } });
    });
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------
  describe('create', () => {
    it('creates a record and returns a UserEntity with the persisted data', async () => {
      const mockCreate = jest.fn().mockResolvedValue(makeMockRecord(SAMPLE_ATTRS));
      const repo = new SequelizeUserRepository(buildMockModel({ create: mockCreate }));

      const result = await repo.create(SAMPLE_REGISTER_DTO);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(SAMPLE_ATTRS.id);
      expect(result.username).toBe(SAMPLE_ATTRS.username);
      expect(result.email).toBe(SAMPLE_ATTRS.email);
      expect(result.passwordHash).toBe(SAMPLE_ATTRS.password);
      expect(mockCreate).toHaveBeenCalledWith({
        username: SAMPLE_REGISTER_DTO.username,
        email: SAMPLE_REGISTER_DTO.email,
        password: SAMPLE_REGISTER_DTO.password,
      });
    });
  });
});
