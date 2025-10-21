import {
  z,
  ZodTypeAny,
  ZodDefault,
  ZodObject,
  ZodOptional,
  ZodEffects,
} from 'zod';
import { configSchema } from '@/core/config/config.schema';
import { ConfigSchema } from './config.types';

function getDefaults(
  schema: ZodTypeAny,
  userConfig?: Partial<ConfigSchema>,
): unknown {
  // For ZodDefault, return the default value immediately
  if (schema instanceof ZodDefault) {
    return schema._def.defaultValue();
  }

  // For ZodOptional, unwrap the inner type and recurse
  if (schema instanceof ZodOptional) {
    return getDefaults(schema._def.innerType, userConfig);
  }

  // For ZodEffects, unwrap the inner schema and recurse
  if (schema instanceof ZodEffects) {
    return getDefaults(schema._def.schema, userConfig);
  }

  // For objects, traverse keys only if userConfig has them
  if (schema instanceof ZodObject) {
    const shape = schema.shape;
    if (userConfig == null || typeof userConfig !== 'object') {
      // No user config for this object, so don't add defaults. Return undefined.
      return undefined;
    }

    const defaults: Record<string, unknown> = {};
    for (const key in shape) {
      // Only consider keys present in userConfig to avoid creating unwanted defaults
      if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
        const def = getDefaults(shape[key], userConfig[key]);
        if (def !== undefined) {
          defaults[key] = def;
        }
      }
    }
    return Object.keys(defaults).length > 0 ? defaults : undefined;
  }

  // For all other schema types, no defaults are added here, return undefined
  return undefined;
}

function getDefaultConfig(userConfig?: Partial<ConfigSchema>) {
  return getDefaults(configSchema, userConfig);
}

export default getDefaultConfig;
