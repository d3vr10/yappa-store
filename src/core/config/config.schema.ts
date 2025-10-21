import ms from 'ms';
import { z } from 'zod';
import {
  flattenZodSchema,
} from './config.utils';

export const configSchema = z.object({
  basic: z.object({
    config: z.string().optional(),
    listenPort: z.number().default(3000),
    externalUrl: z.string().optional(),
  }).default({}),
  security: z.object({
    jwt: z.object({
      secret: z.string().default('changeme'),
      expiresIn: z.string().default('5m'),
      algo: z.string().default('HS256'),
      refreshToken: z.object({
        expiresIn: z.string().default('7d'),
        secret: z.string().default('changeme'),
      }).default({}),
    }).default({}),
  }).default({}),
  db: z.object({
    authDb: z.string().default('admin'),
    name: z.string().default('yappa'),
    host: z.string().default('localhost'),
    username: z.string().default('admin'),
    password: z.string().default('changeme'),
    ssl: z.boolean().default(false),
    port: z.number().min(0).max(65325).default(3333),
    uri: z.string().default(''),
  }).transform((val) => { 
    val.uri = `mongodb://${val.username}:${val.password}@${val.host}:${val.port}/${val.name}?authSource=${val.authDb}`
    return val
  })
});

//For quick access to validators via single-level path-mapping object
export const flattenedConfigSchema = flattenZodSchema(configSchema);
