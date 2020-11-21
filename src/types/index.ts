import { ClientCache, ClientRepository } from "../infrastructure";
import { IKoaAppContext } from "@lindorm-io/koa";
import { MongoConnection } from "@lindorm-io/mongo";
import { RedisConnection } from "@lindorm-io/redis";
import { Client } from "../entity";

export interface IKoaClientCache {
  client: ClientCache;
}

export interface IKoaClientRepository {
  client: ClientRepository;
}

export interface IKoaClientContext extends IKoaAppContext {
  client: Client;
  mongo: MongoConnection;
  redis: RedisConnection;
  cache: IKoaClientCache;
  repository: IKoaClientRepository;
}
