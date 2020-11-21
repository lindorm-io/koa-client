import MockDate from "mockdate";
import { AssertClientSecretError, ClientMatchConflictError } from "../error";
import { Client } from "../entity";
import { CryptoSecret } from "@lindorm-io/crypto";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { TPromise } from "@lindorm-io/core";
import { clientValidationMiddleware } from "./client-validation-middleware";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "be3a62d1-24a0-401c-96dd-3aff95356811"),
}));

MockDate.set("2020-01-01 08:00:00.000");

const logger = new Logger({ packageName: "n", packageVersion: "v" });
logger.addConsole(LogLevel.ERROR);

const cryptoOptions = {
  aesSecret: "aes",
  shaSecret: "sha",
};

const crypto = new CryptoSecret(cryptoOptions);

describe("clientValidationMiddleware", () => {
  let ctx: any;
  let next: TPromise<void>;
  let client: Client;

  beforeEach(() => {
    client = new Client({
      secret: crypto.encrypt("secret"),
    });

    ctx = {
      client,
      logger,
      request: {
        body: {
          clientId: client.id,
          clientSecret: "secret",
        },
      },
    };
    next = () => Promise.resolve();
  });

  test("should validate client secret", async () => {
    await expect(clientValidationMiddleware(cryptoOptions)(ctx, next)).resolves.toBe(undefined);

    expect(ctx.metrics.clientValidation).toStrictEqual(expect.any(Number));
  });

  test("should skip validating client secret", async () => {
    ctx.client.secret = undefined;
    ctx.request.body.clientSecret = undefined;

    await expect(clientValidationMiddleware(cryptoOptions)(ctx, next)).resolves.toBe(undefined);
  });

  test("should reject erroneous client id", async () => {
    ctx.request.body.clientId = "8d1f21f8-8927-455e-a7b6-b78585369458";

    await expect(clientValidationMiddleware(cryptoOptions)(ctx, next)).rejects.toThrow(
      expect.any(ClientMatchConflictError),
    );
  });

  test("should reject erroneous client secret", async () => {
    ctx.request.body.clientSecret = "wrong";

    await expect(clientValidationMiddleware(cryptoOptions)(ctx, next)).rejects.toThrow(
      expect.any(AssertClientSecretError),
    );
  });
});
