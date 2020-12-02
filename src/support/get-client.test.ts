import MockDate from "mockdate";
import { CacheEntityNotFoundError } from "@lindorm-io/redis";
import { Client } from "../entity";
import { RepositoryEntityNotFoundError } from "@lindorm-io/mongo";
import { getClient } from "./get-client";
import {
  getGreyBoxCache,
  getGreyBoxRepository,
  inMemoryCache,
  inMemoryStore,
  logger,
  resetCache,
  resetStore,
} from "../test";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "be3a62d1-24a0-401c-96dd-3aff95356811"),
}));

MockDate.set("2020-01-01 08:00:00.000");

describe("getClient", () => {
  let ctx: any;

  beforeEach(async () => {
    ctx = {
      cache: await getGreyBoxCache(),
      logger,
      repository: await getGreyBoxRepository(),
    };
  });

  afterEach(() => {
    resetCache();
    resetStore();
  });

  test("should resolve client from cache", async () => {
    await ctx.cache.client.create(
      new Client({
        id: "950b90fc-0d07-4712-8226-192ae18cbc7c",
      }),
    );

    await expect(getClient(ctx)("950b90fc-0d07-4712-8226-192ae18cbc7c")).resolves.toMatchSnapshot();

    expect(inMemoryCache).toMatchSnapshot();
  });

  test("should resolve client from repository", async () => {
    await ctx.repository.client.create(
      new Client({
        id: "950b90fc-0d07-4712-8226-192ae18cbc7c",
      }),
    );

    await expect(getClient(ctx)("950b90fc-0d07-4712-8226-192ae18cbc7c")).resolves.toMatchSnapshot();

    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should throw CacheEntityNotFoundError", async () => {
    await expect(getClient(ctx)("950b90fc-0d07-4712-8226-192ae18cbc7c", { disableRepository: true })).rejects.toThrow(
      expect.any(CacheEntityNotFoundError),
    );
  });

  test("should throw RepositoryEntityNotFoundError", async () => {
    await expect(getClient(ctx)("950b90fc-0d07-4712-8226-192ae18cbc7c", { disableCache: true })).rejects.toThrow(
      expect.any(RepositoryEntityNotFoundError),
    );
  });
});
