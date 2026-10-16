import Redis from "ioredis";

// In-Memory Mutex Fallback
interface MemLock {
  userId: string;
  expiresAt: number;
}

const memoryLockStore = new Map<string, MemLock>();

// Lazy Redis initialization
let redisClient: Redis | null = null;
let isRedisAvailable = false;

function getRedis(): Redis | null {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        retryStrategy: () => null, // don't spam retries if redis is not running
        lazyConnect: true,
      });

      redisClient.on("error", () => {
        isRedisAvailable = false;
      });

      redisClient
        .connect()
        .then(() => {
          isRedisAvailable = true;
        })
        .catch(() => {
          isRedisAvailable = false;
        });
    } catch {
      isRedisAvailable = false;
    }
  }
  return isRedisAvailable ? redisClient : null;
}

/**
 * Attempt to acquire a mutex lock on a slot for ttlSeconds (default 180s).
 * Returns true if lock was acquired by this user, false if already locked by someone else.
 */
export async function acquireLock(
  slotId: string,
  userId: string,
  ttlSeconds: number = 180
): Promise<{ success: boolean; remainingSeconds?: number; lockedByMe?: boolean }> {
  const lockKey = `lock:slot:${slotId}`;
  const redis = getRedis();

  if (redis && isRedisAvailable) {
    try {
      // SET lockKey userId NX EX ttlSeconds
      const res = await redis.set(lockKey, userId, "EX", ttlSeconds, "NX");
      if (res === "OK") {
        return { success: true, remainingSeconds: ttlSeconds, lockedByMe: true };
      }

      // Check if current user already holds it
      const currentHolder = await redis.get(lockKey);
      if (currentHolder === userId) {
        const ttl = await redis.ttl(lockKey);
        return { success: true, remainingSeconds: ttl > 0 ? ttl : ttlSeconds, lockedByMe: true };
      }

      const ttl = await redis.ttl(lockKey);
      return { success: false, remainingSeconds: ttl > 0 ? ttl : 180, lockedByMe: false };
    } catch (err) {
      console.warn("[LockManager] Redis error, falling back to in-memory lock:", err);
    }
  }

  // High-performance In-Memory Atomic Fallback
  const now = Date.now();
  const existing = memoryLockStore.get(slotId);

  if (existing) {
    if (existing.expiresAt > now) {
      if (existing.userId === userId) {
        return {
          success: true,
          remainingSeconds: Math.ceil((existing.expiresAt - now) / 1000),
          lockedByMe: true,
        };
      }
      return {
        success: false,
        remainingSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        lockedByMe: false,
      };
    } else {
      // Expired lock, clean up
      memoryLockStore.delete(slotId);
    }
  }

  memoryLockStore.set(slotId, {
    userId,
    expiresAt: now + ttlSeconds * 1000,
  });

  return { success: true, remainingSeconds: ttlSeconds, lockedByMe: true };
}

/**
 * Release a mutex lock if held by userId
 */
export async function releaseLock(slotId: string, userId: string): Promise<boolean> {
  const lockKey = `lock:slot:${slotId}`;
  const redis = getRedis();

  if (redis && isRedisAvailable) {
    try {
      const current = await redis.get(lockKey);
      if (current === userId) {
        await redis.del(lockKey);
        return true;
      }
      return false;
    } catch {
      // Fallback
    }
  }

  const existing = memoryLockStore.get(slotId);
  if (existing && existing.userId === userId) {
    memoryLockStore.delete(slotId);
    return true;
  }
  return false;
}

/**
 * Check if a slot is currently locked
 */
export async function getLockStatus(slotId: string): Promise<{ isLocked: boolean; lockedBy?: string; remainingSeconds: number }> {
  const lockKey = `lock:slot:${slotId}`;
  const redis = getRedis();

  if (redis && isRedisAvailable) {
    try {
      const holder = await redis.get(lockKey);
      if (holder) {
        const ttl = await redis.ttl(lockKey);
        return { isLocked: true, lockedBy: holder, remainingSeconds: Math.max(0, ttl) };
      }
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      // Fallback
    }
  }

  const now = Date.now();
  const existing = memoryLockStore.get(slotId);
  if (existing && existing.expiresAt > now) {
    return {
      isLocked: true,
      lockedBy: existing.userId,
      remainingSeconds: Math.ceil((existing.expiresAt - now) / 1000),
    };
  }

  if (existing) memoryLockStore.delete(slotId);
  return { isLocked: false, remainingSeconds: 0 };
}
