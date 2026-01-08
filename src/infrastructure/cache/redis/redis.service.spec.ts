import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

// Mock ioredis
const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService - Distributed Locks', () => {
  let service: RedisService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'REDIS_URL') {
                return 'redis://localhost:6379';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);

    await service.onModuleInit();
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should set a value without expiration', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('test:key1', 'value1');

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test:key1',
        'value1',
      );
    });

    it('should set value with custom expiration', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('test:key2', 'value2', 120);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test:key2',
        'value2',
        'EX',
        120,
      );
    });

    it('should get a value', async () => {
      mockRedisClient.get.mockResolvedValue('value1');

      const value = await service.get('test:key1');

      expect(value).toBe('value1');
      expect(mockRedisClient.get).toHaveBeenCalledWith('test:key1');
    });

    it('should delete a key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('test:key3');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test:key3');
    });

    it('should check if key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const exists = await service.exists('test:key4');

      expect(exists).toBe(1);
      expect(mockRedisClient.exists).toHaveBeenCalledWith('test:key4');
    });

    it('should get keys by pattern', async () => {
      mockRedisClient.keys.mockResolvedValue(['test:1', 'test:2', 'test:3']);

      const keys = await service.keys('test:*');

      expect(keys).toEqual(['test:1', 'test:2', 'test:3']);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('test:*');
    });
  });

  describe('Distributed Locks', () => {
    it('should acquire a lock successfully', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const acquired = await service.acquireLock('lock:auction-1', 'club-1', 30);

      expect(acquired).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'lock:auction-1',
        'club-1',
        'EX',
        30,
        'NX',
      );
    });

    it('should fail to acquire lock when already held', async () => {
      // Redis returns null when SET with NX fails (key already exists)
      mockRedisClient.set.mockResolvedValue(null);

      const acquired = await service.acquireLock('lock:auction-2', 'club-2', 30);

      expect(acquired).toBe(false);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'lock:auction-2',
        'club-2',
        'EX',
        30,
        'NX',
      );
    });

    it('should release a lock', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.releaseLock('lock:auction-3');

      expect(mockRedisClient.del).toHaveBeenCalledWith('lock:auction-3');
    });

    it('should handle concurrent lock attempts correctly', async () => {
      // Simulate race condition: first attempt succeeds, others fail
      mockRedisClient.set
        .mockResolvedValueOnce('OK') // First club succeeds
        .mockResolvedValueOnce(null) // Second club fails
        .mockResolvedValueOnce(null) // Third club fails
        .mockResolvedValueOnce(null) // Fourth club fails
        .mockResolvedValueOnce(null); // Fifth club fails

      const clubs = ['club-1', 'club-2', 'club-3', 'club-4', 'club-5'];
      const lockKey = 'lock:auction-race';

      const results = await Promise.all(
        clubs.map((clubId) => service.acquireLock(lockKey, clubId, 10)),
      );

      // Only one should succeed
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(1);
      expect(results[0]).toBe(true); // First one wins
      expect(results.slice(1).every((r) => r === false)).toBe(true); // Others lose
    });

    it('should simulate real auction claim race condition', async () => {
      const auctionId = 'auction-race-test';
      const lockKey = `lock:${auctionId}`;

      // Mock: first call succeeds, subsequent calls fail
      mockRedisClient.set
        .mockResolvedValueOnce('OK')
        .mockResolvedValue(null);

      mockRedisClient.del.mockResolvedValue(1);

      // Simulate 3 clubs trying to claim simultaneously
      const claimAttempts = [
        simulateClubClaim(service, lockKey, 'club-1', auctionId),
        simulateClubClaim(service, lockKey, 'club-2', auctionId),
        simulateClubClaim(service, lockKey, 'club-3', auctionId),
      ];

      const results = await Promise.all(claimAttempts);

      // Verify only one claim succeeded
      const successfulClaims = results.filter((r) => r.success);
      expect(successfulClaims).toHaveLength(1);

      // Verify others were rejected
      const failedClaims = results.filter((r) => !r.success);
      expect(failedClaims).toHaveLength(2);
      failedClaims.forEach((claim) => {
        expect(claim.message).toBe('Lock already acquired by another club');
      });
    });

    it('should properly use NX flag for atomic lock acquisition', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.acquireLock('lock:test', 'value', 60);

      // Verify NX flag is used for atomic operation
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'lock:test',
        'value',
        'EX',
        60,
        'NX', // This ensures atomicity
      );
    });

    it('should set TTL when acquiring lock', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.acquireLock('lock:ttl-test', 'club-1', 45);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'lock:ttl-test',
        'club-1',
        'EX',
        45, // TTL in seconds
        'NX',
      );
    });
  });
});

// Helper function to simulate club claiming auction
async function simulateClubClaim(
  redis: RedisService,
  lockKey: string,
  clubId: string,
  auctionId: string,
): Promise<{ success: boolean; clubId: string; message: string }> {
  try {
    // Try to acquire lock
    const lockAcquired = await redis.acquireLock(lockKey, clubId, 5);

    if (!lockAcquired) {
      return {
        success: false,
        clubId,
        message: 'Lock already acquired by another club',
      };
    }

    // Simulate processing (database operations, etc.)
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Release lock
    await redis.releaseLock(lockKey);

    return {
      success: true,
      clubId,
      message: 'Auction claimed successfully',
    };
  } catch (error) {
    return {
      success: false,
      clubId,
      message: error.message,
    };
  }
}
