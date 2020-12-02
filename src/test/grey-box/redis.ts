import { ClientCache } from "../../infrastructure";
import { RedisConnection, RedisConnectionType } from "@lindorm-io/redis";
import { inMemoryCache } from "./in-memory";
import { logger } from "./logger";

export interface IGetGreyBoxCache {
  client: ClientCache;
}

export const getGreyBoxCache = async (): Promise<IGetGreyBoxCache> => {
  const redis = new RedisConnection({
    type: RedisConnectionType.MEMORY,
    inMemoryCache,
    port: 12345,
  });

  await redis.connect();
  const client = redis.getClient();

  return {
    client: new ClientCache({ client, logger }),
  };
};
