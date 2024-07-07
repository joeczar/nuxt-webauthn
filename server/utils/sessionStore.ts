import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redisClient = new Redis({
    host: useRuntimeConfig().REDIS_HOST,
    port: parseInt(useRuntimeConfig().REDIS_PORT || '6379'),
});

export async function createSession(userId: string): Promise<string> {
    const sessionId = uuidv4();
    await redisClient.set(`session:${sessionId}`, userId, 'EX', 3600); // 1 hour expiration
    return sessionId;
}

export async function getSessionWithId(sessionId: string): Promise<string | null> {
    return redisClient.get(`session:${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
    await redisClient.del(`session:${sessionId}`);
}

export async function refreshSession(sessionId: string): Promise<void> {
    await redisClient.expire(`session:${sessionId}`, 3600); // Refresh for another hour
}