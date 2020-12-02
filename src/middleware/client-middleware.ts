import Joi from "@hapi/joi";
import { IKoaClientContext } from "../types";
import { InvalidClientError, RejectedClientError } from "../error";
import { TPromise } from "@lindorm-io/core";
import { getClient, IGetClientOptions } from "../support";

const schema = Joi.object({
  clientId: Joi.string().guid().required(),
});

export const clientMiddleware = (options?: IGetClientOptions) => async (
  ctx: IKoaClientContext,
  next: TPromise<void>,
): Promise<void> => {
  const start = Date.now();

  const { logger, metadata } = ctx;
  const { clientId } = metadata;

  await schema.validateAsync({ clientId });

  try {
    ctx.client = await getClient(ctx)(clientId, options);
  } catch (err) {
    throw new InvalidClientError(clientId, err);
  }

  logger.debug("validating client approval setting", { approved: ctx.client.approved });

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
