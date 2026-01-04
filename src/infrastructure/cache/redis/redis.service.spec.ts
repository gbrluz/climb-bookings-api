import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

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
                return process.env.REDIS_URL || 'redis://localhost:6379';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);

    // Initialize connection
    await service.onModuleInit();
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  beforeEach(async () => {
    // Clean up any existing test keys
    const keys = await service.keys('test:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => service.del(key)));
    }
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      await service.set('test:key1', 'value1');
      const value = await service.get('test:key1');
      expect(value).toBe('value1');
    });

    it('should set value with expiration', async () => {
      await service.set('test:key2', 'value2', 2);
      const value = await service.get('test:key2');
      expect(value).toBe('value2');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 2100));
      const expiredValue = await service.get('test:key2');
      expect(expiredValue).toBeNull();
    });

    it('should delete a key', async () => {
      await service.set('test:key3', 'value3');
      await service.del('test:key3');
      const value = await service.get('test:key3');
      expect(value).toBeNull();
    });

    it('should check if key exists', async () => {
      await service.set('test:key4', 'value4');
      const exists = await service.exists('test:key4');
      expect(exists).toBe(1);

      await service.del('test:key4');
      const notExists = await service.exists('test:key4');
      expect(notExists).toBe(0);
    });
  });

  describe('Distributed Locks', () => {
    it('should acquire a lock successfully', async () => {
      const lockKey = 'test:lock:auction-1';
      const acquired = await service.acquireLock(lockKey, 'club-1', 10);
      expect(acquired).toBe(true);

      // Verify lock exists
      const exists = await service.exists(lockKey);
      expect(exists).toBe(1);

      // Clean up
      await service.releaseLock(lockKey);
    });

    it('should fail to acquire lock when already held', async () => {
      const lockKey = 'test:lock:auction-2';

      // First acquisition
      const firstAcquire = await service.acquireLock(lockKey, 'club-1', 10);
      expect(firstAcquire).toBe(true);

      // Second acquisition should fail
      const secondAcquire = await service.acquireLock(lockKey, 'club-2', 10);
      expect(secondAcquire).toBe(false);

      // Clean up
      await service.releaseLock(lockKey);
    });

    it('should release a lock', async () => {
      const lockKey = 'test:lock:auction-3';

      await service.acquireLock(lockKey, 'club-1', 10);
      await service.releaseLock(lockKey);

      // Should be able to acquire again
      const acquired = await service.acquireLock(lockKey, 'club-2', 10);
      expect(acquired).toBe(true);

      await service.releaseLock(lockKey);
    });

    it('should auto-expire lock after TTL', async () => {
      const lockKey = 'test:lock:auction-4';

      await service.acquireLock(lockKey, 'club-1', 1); // 1 second TTL

      // Lock should exist
      let exists = await service.exists(lockKey);
      expect(exists).toBe(1);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Lock should be gone
      exists = await service.exists(lockKey);
      expect(exists).toBe(0);

      // Should be able to acquire again
      const acquired = await service.acquireLock(lockKey, 'club-2', 10);
      expect(acquired).toBe(true);

      await service.releaseLock(lockKey);
    });

    it('should handle concurrent lock attempts', async () => {
      const lockKey = 'test:lock:auction-5';
      const clubs = ['club-1', 'club-2', 'club-3', 'club-4', 'club-5'];

      // Try to acquire lock concurrently
      const results = await Promise.all(
        clubs.map((clubId) => service.acquireLock(lockKey, clubId, 10)),
      );

      // Only one should succeed
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(1);

      await service.releaseLock(lockKey);
    });

    it('should simulate real auction claim race condition', async () => {
      const auctionId = 'auction-race-test';
      const lockKey = `test:lock:${auctionId}`;

      // Simulate 3 clubs trying to claim at the same time
      const claimAttempts = [
        simulateClubClaim(service, lockKey, 'club-1', auctionId),
        simulateClubClaim(service, lockKey, 'club-2', auctionId),
        simulateClubClaim(service, lockKey, 'club-3', auctionId),
      ];

      const results = await Promise.all(claimAttempts);

      // Only one should succeed
      const successfulClaims = results.filter((r) => r.success);
      expect(successfulClaims).toHaveLength(1);

      // Check which club won
      const winner = successfulClaims[0];
      expect(['club-1', 'club-2', 'club-3']).toContain(winner.clubId);

      console.log(`🏆 Winner: ${winner.clubId}`);
      console.log(`Results:`, results);
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
    await new Promise((resolve) => setTimeout(resolve, 50));

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
