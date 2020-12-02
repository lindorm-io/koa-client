import { Logger, LogLevel } from "@lindorm-io/winston";

export const logger = new Logger({
  packageName: "n",
  packageVersion: "v",
  test: true,
});
logger.addConsole(LogLevel.SILLY);
