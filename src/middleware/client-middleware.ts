import { IKoaClientContext } from "../types";
import { InvalidClientError, RejectedClientError } from "../error";
import { TPromise } from "@lindorm-io/core";
import Joi from "@hapi/joi";

const schema = Joi.object({
  clientId: Joi.string().guid().required(),
});

export const clientMiddleware = async (ctx: IKoaClientContext, next: TPromise<void>): Promise<void> => {
  const start = Date.now();

  const { cache, logger, metadata } = ctx;
  const { clientId } = metadata;

  await schema.validateAsync({ clientId });

  try {
    ctx.client = await cache.client.find(clientId);
  } catch (err) {
    throw new InvalidClientError(clientId, err);
  }

  if (!ctx.client.approved) {
    throw new RejectedClientError(clientId);
  }

  logger.debug("valid client found", { clientId });

  ctx.metrics = {
    ...(ctx.metrics || {}),
    client: Date.now() - start,
  };

  await next();
};
