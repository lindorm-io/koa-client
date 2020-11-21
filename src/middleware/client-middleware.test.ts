import MockDate from "mockdate";
import { Client } from "../entity";
import { ClientCache } from "../infrastructure/client";
import { IRedisConnectionOptions, RedisConnection, RedisConnectionType } from "@lindorm-io/redis";
import { InvalidClientError, RejectedClientError } from "../error";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { TPromise } from "@lindorm-io/core";
import { clientMiddleware } from "./client-middleware";

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

describe("clientMiddleware", () => {
  let ctx: any;
  let next: TPromise<void>;
  let client: Client;

  beforeEach(async () => {
    const redis = new RedisConnection(redisOptions);
    await redis.connect();

    client = new Client({ approved: true });
    ctx = {
      cache: {
        client: new ClientCache({
          client: redis.getClient(),
          logger,
        }),
      },
      logger,
      metadata: {
        clientId: client.id,
      },
    };
    next = () => Promise.resolve();

    await ctx.cache.client.create(client);
  });

  test("should set client on context", async () => {
    await expect(clientMiddleware(ctx, next)).resolves.toBe(undefined);

    expect(ctx.client).toMatchSnapshot();
    expect(ctx.metrics.client).toStrictEqual(expect.any(Number));
  });

  test("should reject client when id is mismatched", async () => {
    ctx.metadata.clientId = "e181c870-dd78-4d49-b9f5-9202f63f6e00";

    await expect(clientMiddleware(ctx, next)).rejects.toThrow(expect.any(InvalidClientError));
  });

  test("should reject client when it is not approved", async () => {
    client.approved = false;
    await ctx.cache.client.update(client);

    await expect(clientMiddleware(ctx, next)).rejects.toThrow(expect.any(RejectedClientError));
  });
});
