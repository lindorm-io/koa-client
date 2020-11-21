import { ClientCache, ClientRepository } from "../infrastructure";
import { IMongoConnectionOptions, MongoConnection } from "@lindorm-io/mongo";
import { IRedisConnectionOptions, RedisConnection } from "@lindorm-io/redis";
import { IntervalWorker } from "@lindorm-io/koa";
import { Logger } from "@lindorm-io/winston";

export interface IClientCacheWorker {
  logger: Logger;
  mongoConnectionOptions: IMongoConnectionOptions;
  redisConnectionOptions: IRedisConnectionOptions;
  workerIntervalInMilliseconds: number;
}

export const clientCacheWorker = (options: IClientCacheWorker): IntervalWorker => {
  const { logger, mongoConnectionOptions, redisConnectionOptions, workerIntervalInMilliseconds } = options;

  const redisExpiresInSeconds = workerIntervalInMilliseconds / 1000 + 120;

  const workerCallback = async (): Promise<void> => {
    const mongo = new MongoConnection(mongoConnectionOptions);
    await mongo.connect();
    const repository = new ClientRepository({
      db: mongo.getDatabase(),
      logger,
    });

    const redis = new RedisConnection(redisConnectionOptions);
    await redis.connect();
    const cache = new ClientCache({
      client: redis.getClient(),
      logger,
      expiresInSeconds: redisExpiresInSeconds,
    });

    const array = await repository.findMany({});

    for (const entity of array) {
      await cache.create(entity);
    }

    await mongo.disconnect();
    await redis.disconnect();
  };

  return new IntervalWorker({
    callback: workerCallback,
    logger,
    time: workerIntervalInMilliseconds,
  });
};
