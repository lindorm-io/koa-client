import MockDate from "mockdate";
import { Client } from "../entity";
import { InvalidClientError, RejectedClientError } from "../error";
import { TPromise } from "@lindorm-io/core";
import { clientMiddleware } from "./client-middleware";
import { logger } from "../test/grey-box";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "be3a62d1-24a0-401c-96dd-3aff95356811"),
}));

const getClient = jest.fn((..._: any) => new Client({ approved: true }));
jest.mock("../support", () => ({
  getClient: jest.fn(() => getClient),
}));

MockDate.set("2020-01-01 08:00:00.000");

describe("clientMiddleware", () => {
  let ctx: any;
  let next: TPromise<void>;

  beforeEach(async () => {
    ctx = {
      logger,
      metadata: {
        clientId: "be3a62d1-24a0-401c-96dd-3aff95356811",
      },
    };
    next = () => Promise.resolve();
  });

  afterEach(jest.clearAllMocks);

  test("should set client on context", async () => {
    await expect(clientMiddleware()(ctx, next)).resolves.toBe(undefined);

    expect(ctx.client).toMatchSnapshot();
    expect(ctx.metrics.client).toStrictEqual(expect.any(Number));
  });

  test("should propagate options", async () => {
    await expect(clientMiddleware({ disableCache: true, disableRepository: true })(ctx, next)).resolves.toBe(undefined);

    expect(getClient).toHaveBeenCalledWith("be3a62d1-24a0-401c-96dd-3aff95356811", {
      disableCache: true,
      disableRepository: true,
    });
  });

  test("should throw InvalidClientError", async () => {
    getClient.mockImplementation(() => {
      throw new Error("mock");
    });
    await expect(clientMiddleware()(ctx, next)).rejects.toThrow(expect.any(InvalidClientError));
  });

  test("should throw RejectedClientError", async () => {
    getClient.mockImplementation(() => new Client({ approved: false }));
    await expect(clientMiddleware()(ctx, next)).rejects.toThrow(expect.any(RejectedClientError));
  });
});
