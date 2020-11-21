import { APIError, HttpStatus } from "@lindorm-io/core";

export class ClientMatchConflictError extends APIError {
  constructor(expect: string, actual: string) {
    super("Client Match Conflict", {
      debug: { expect, actual },
      statusCode: HttpStatus.ClientError.BAD_REQUEST,
    });
  }
}
