import MockDate from "mockdate";
import { CacheEntityNotFoundError } from "@lindorm-io/redis/dist/error";
import { Client } from "../../entity";
import { ClientCache } from "./ClientCache";
import { IRedisConnectionOptions, RedisConnection, RedisConnectionType } from "@lindorm-io/redis";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { baseHash } from "@lindorm-io/core";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "be3a62d1-24a0-401c-96dd-3aff95356811"),
}));

MockDate.set("2020-01-01 08:00:00.000");

const redisOptions: IRedisConnectionOptions = {
  type: RedisConnectionType.MEMORY,
  port: 12345,
};

const logger = new Logger({ packageName: "n", packageVersion: "v" });
logger.addConsole(LogLevel.ERROR);

describe("ClientCache", () => {
  let cache: ClientCache;
  let client: Client;

  beforeEach(async () => {
    const redis = new RedisConnection(redisOptions);
    await redis.connect();

    cache = new ClientCache({
      client: redis.getClient(),
      logger,
    });
    client = new Client({
      approved: true,
      description: "description",
      extra: { emailAuthorizationUri: "https://lindorm.io" },
      name: "name",
      secret: baseHash("secret"),
    });
  });

  test("should create", async () => {
    await expect(cache.create(client)).resolves.toMatchSnapshot();
  });

  test("should update", async () => {
    await cache.create(client);

    await expect(cache.update(client)).resolves.toMatchSnapshot();
  });

  test("should find", async () => {
    await cache.create(client);

    await expect(cache.find(client.id)).resolves.toMatchSnapshot();
  });

  test("should remove", async () => {
    await cache.create(client);

    await expect(cache.remove(client)).resolves.toBe(undefined);
    await expect(cache.find(client.id)).rejects.toStrictEqual(expect.any(CacheEntityNotFoundError));
  });
});
