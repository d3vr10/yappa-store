import { z, ZodTypeAny, ZodObject, ZodUnion } from 'zod';
import { configSchema } from '@/core/config/config.schema';
import { toConstCase } from '@/core/config/config.utils';

type EnvVarMap = Record<string, string[]>;
export const ENV_PREFIX = 'XNTHA';

function isLeafType(schema: ZodTypeAny): boolean {
  const t = schema._def.typeName;
  switch (t) {
    case z.ZodFirstPartyTypeKind.ZodString:
    case z.ZodFirstPartyTypeKind.ZodNumber:
    case z.ZodFirstPartyTypeKind.ZodBoolean:
    case z.ZodFirstPartyTypeKind.ZodEnum:
    case z.ZodFirstPartyTypeKind.ZodNativeEnum:
    case z.ZodFirstPartyTypeKind.ZodLiteral:
    case z.ZodFirstPartyTypeKind.ZodDate:
      return true;
    case z.ZodFirstPartyTypeKind.ZodDefault:
    case z.ZodFirstPartyTypeKind.ZodNullable:
    case z.ZodFirstPartyTypeKind.ZodOptional:
      return isLeafType(schema._def.innerType);
    default:
      return false;
  }
}

function generateEnvVarToPathMap(
  schema: ZodObject<any>,
  prefix: string[] = [],
  envVarPrefix = ENV_PREFIX,
): EnvVarMap {
  const result: EnvVarMap = {};

  const pathToEnvVarName = (path: string[]) =>
    envVarPrefix + '_' + path.map(toConstCase).join('_');

  function recurse(s: ZodTypeAny, path: string[]) {
    if (isLeafType(s)) {
      // This is a leaf, generate env var key
      const envVar = pathToEnvVarName(path);
      result[envVar] = path;
    } else if (s._def.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
      // recurse into object keys
      const shape = (s as ZodObject<any>).shape;
      for (const key in shape) {
        recurse(shape[key], [...path, key]);
      }
    } else if (s._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault) {
      recurse((s as any)._def.innerType, path);
    } else if (s._def.typeName === z.ZodFirstPartyTypeKind.ZodNullable) {
      recurse((s as any)._def.innerType, path);
    } else if (s._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional) {
      recurse((s as any)._def.innerType, path);
    } else if (s._def.typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
      recurse((s as any)._def.schema, path);
    } else {
    }
  }

  recurse(schema, prefix);

  return result;
}

function parseEnvArgs(
  env: NodeJS.ProcessEnv = process.env,
  mapping: EnvVarMap = generateEnvVarToPathMap(configSchema),
) {
  const result: any = {};

  for (const [envKey, path] of Object.entries(mapping)) {
    const value = env[envKey];
    if (value === undefined) continue;

    let current = result;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        current[key] = value;
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  }

  return result;
}

export default parseEnvArgs;
