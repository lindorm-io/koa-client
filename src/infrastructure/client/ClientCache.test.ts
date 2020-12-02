import MockDate from "mockdate";
import { CacheEntityNotFoundError } from "@lindorm-io/redis/dist/error";
import { Client } from "../../entity";
import { ClientCache } from "./ClientCache";
import { baseHash } from "@lindorm-io/core";
import { getGreyBoxCache, resetCache } from "../../test/grey-box";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "be3a62d1-24a0-401c-96dd-3aff95356811"),
}));

MockDate.set("2020-01-01 08:00:00.000");

describe("ClientCache", () => {
  let cache: ClientCache;
  let client: Client;

  beforeEach(async () => {
    ({ client: cache } = await getGreyBoxCache());

    client = new Client({
      approved: true,
      description: "description",
      extra: { emailAuthorizationUri: "https://lindorm.io" },
      name: "name",
      secret: baseHash("secret"),
    });
  });

  afterEach(resetCache);

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
