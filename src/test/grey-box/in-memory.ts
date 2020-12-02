import { TObject } from "@lindorm-io/core";

export let inMemoryCache: TObject<any> = {};
export let inMemoryStore: TObject<any> = {};

export const resetCache = (): void => {
  inMemoryCache = {};
};

export const resetStore = (): void => {
  inMemoryStore = {};
};
