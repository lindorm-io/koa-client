# @lindorm-io/koa-client
Mongo Connection middleware for @lindorm-io/koa applications

## Installation
```shell script
npm install --save @lindorm-io/koa-client
```

### Peer Dependencies
This package has the following peer dependencies: 
* [@lindorm-io/koa](https://www.npmjs.com/package/@lindorm-io/koa)
* [@lindorm-io/koa-mongo](https://www.npmjs.com/package/@lindorm-io/koa-mongo)
* [@lindorm-io/koa-redis](https://www.npmjs.com/package/@lindorm-io/koa-redis)
* [@lindorm-io/mongo](https://www.npmjs.com/package/@lindorm-io/mongo)
* [@lindorm-io/redis](https://www.npmjs.com/package/@lindorm-io/redis)

## Usage

### Client Middleware

```typescript
// Add after mongoMiddleware and redisMiddleware
koaApp.addMiddleware(clientMiddleware);
```

### Client Validation Middleware

```typescript
// Add after clientMiddleware on paths you want protected by clientId and clientSecret in body
koaApp.addMiddleware(clientValidationMiddleware({
  aesSecret: "string",
  shaSecret: "string",
}));
```
