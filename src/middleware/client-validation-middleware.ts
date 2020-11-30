import Joi from "@hapi/joi";
import { AssertClientSecretError, ClientMatchConflictError } from "../error";
import { CryptoSecret, ICryptoSecretOptions } from "@lindorm-io/crypto";
import { IKoaClientContext } from "../types";
import { Middleware } from "koa";
import { stringComparison, TPromise } from "@lindorm-io/core";

const schema = Joi.object({
  clientId: Joi.string().guid().required(),
  clientSecret: Joi.string().allow(null),
});

export const clientValidationMiddleware = (options: ICryptoSecretOptions): Middleware => {
  const crypto = new CryptoSecret(options);

  return async (ctx: IKoaClientContext, next: TPromise<void>): Promise<void> => {
    const start = Date.now();

    const { client, logger } = ctx;
    const { clientId, clientSecret } = ctx.request.body;

    logger.debug("validating client", { clientId });

    await schema.validateAsync({ clientId, clientSecret });

    logger.debug("comparing client id from body with client found in metadata");

    if (!stringComparison(clientId, client.id)) {
      throw new ClientMatchConflictError(clientId, client.id);
    }

    if (client.secret) {
      logger.debug("validating client secret");

      try {
        crypto.assert(clientSecret, client.secret);
      } catch (err) {
        throw new AssertClientSecretError(clientId, err);
      }
    }

    logger.debug("client validated", { clientId });

    ctx.metrics = {
      ...(ctx.metrics || {}),
      clientValidation: Date.now() - start,
    };

    await next();
  };
};
