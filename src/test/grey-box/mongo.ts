import { ClientRepository } from "../../infrastructure";
import { MongoConnection, MongoConnectionType } from "@lindorm-io/mongo";
import { inMemoryStore } from "./in-memory";
import { logger } from "./logger";

export interface IGetGreyBoxRepository {
  client: ClientRepository;
}

export const getGreyBoxRepository = async (): Promise<IGetGreyBoxRepository> => {
  const mongo = new MongoConnection({
    type: MongoConnectionType.MEMORY,
    inMemoryStore,
    auth: {
      user: "user",
      password: "user",
    },
    url: {
      host: "host",
      port: 1234,
    },
    databaseName: "database_name",
  });

  await mongo.connect();
  const db = mongo.getDatabase();

  return {
    client: new ClientRepository({ db, logger }),
  };
};
