import { Client } from "../entity";
import { IKoaClientContext } from "../types";

export interface IGetClientOptions {
  disableCache?: boolean;
  disableRepository?: boolean;
}

export const getClient = (ctx: IKoaClientContext) => async (
  clientId: string,
  options?: IGetClientOptions,
): Promise<Client> => {
  const { cache, logger, repository } = ctx;
  const { disableCache, disableRepository } = options || {};

  if (!disableCache) {
    try {
      logger.debug("find client in cache", { clientId });

      return await cache.client.find(clientId);
    } catch (err) {
      logger.warn("client not found in cache", err);

      if (disableRepository) {
        throw err;
      }
    }
  }

  if (!disableRepository) {
    try {
      logger.debug("find client in repository", { id: clientId });

      return await repository.client.find({ id: clientId });
    } catch (err) {
      logger.error("client not found in repository", err);

      throw err;
    }
  }

  throw new Error("Client not found due to invalid server settings");
};
