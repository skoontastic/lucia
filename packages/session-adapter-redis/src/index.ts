import type {
	SessionSchema,
	SessionAdapter,
	AdapterFunction
} from "lucia-auth";
import type { RedisClientType } from "redis";

const adapter =
	(redisClient: {
		session: RedisClientType<any, any, any>;
		userSessions: RedisClientType<any, any, any>;
	}): AdapterFunction<SessionAdapter> =>
	() => {
		const { session: sessionRedis, userSessions: userSessionsRedis } =
			redisClient;
		return {
			getSession: async (sessionId) => {
				const sessionData = await sessionRedis.get(sessionId);
				if (!sessionData) return null;
				const session = JSON.parse(sessionData) as SessionSchema;
				return session;
			},
			getSessionsByUserId: async (userId) => {
				const sessionIds = await userSessionsRedis.lRange(userId, 0, -1);
				const sessionData = await Promise.all(
					sessionIds.map((id) => sessionRedis.get(id))
				);
				const sessions = sessionData
					.filter((val): val is string => val !== null)
					.map((val) => JSON.parse(val) as SessionSchema);
				return sessions;
			},
			setSession: async (session) => {
				Promise.all([
					userSessionsRedis.lPush(session.user_id, session.id),
					sessionRedis.set(session.id, JSON.stringify(session), {
						EX: Math.floor(Number(session.idle_expires) / 1000)
					})
				]);
			},
			deleteSession: async (...sessionIds) => {
				const targetSessionData = await Promise.all(
					sessionIds.map((id) => sessionRedis.get(id))
				);
				const sessions = targetSessionData
					.filter((val): val is string => val !== null)
					.map((val) => JSON.parse(val) as SessionSchema);
				await Promise.all([
					...sessionIds.map((id) => sessionRedis.del(id)),
					...sessions.map((session) =>
						userSessionsRedis.lRem(session.user_id, 1, session.id)
					)
				]);
			},
			deleteSessionsByUserId: async (userId) => {
				const sessionIds = await userSessionsRedis.lRange(userId, 0, -1);
				await Promise.all([
					...sessionIds.map((id) => sessionRedis.del(id)),
					userSessionsRedis.del(userId)
				]);
			}
		};
	};

export default adapter;
