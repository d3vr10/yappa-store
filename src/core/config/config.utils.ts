import z from 'zod';
import { ZodTypeAny, ZodObject } from 'zod';
import _ from 'lodash';

export function isLeaf(value: unknown): boolean {
  if (Array.isArray(value)) return true;
  if (value === null) return false; // null is object but not a leaf here
  if (typeof value === 'object')
    return Object.keys(value).length === 0 ? false : false; // you can customize this
  return true; // primitives are leaves
}

export function toConstCase(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1_$2') //maybe if we stumble upon acronyms ??
    .toUpperCase();
}

export function transformBoolStringtoBoolean(value, ctx) {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    case '1':
      return true;
    case '0':
      return false;
    default:
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'boolean',
        received: 'string',
        message: 'Expected either "true", "false", "0" or "1"',
      });
  }
}
export const strictBooleanTransform = (val) => {
  if (typeof val === 'boolean') return val;
  if (val.toLowerCase() === 'true' || val === '1') return true;
  if (val.toLowerCase() === 'false' || val === '0') return false;
  throw new Error(
    `Invalid boolean value: '${val}'. Expected 'true'/'false' or '1'/'0'.`,
  );
};
export const strictNumberTransform = (val) => {
  if (typeof val === 'number') return val;
  const num = Number(val);
  if (isNaN(num)) {
    throw new Error(`Invalid number value: '${val}'.`);
  }
  return num;
};
export const strictStringArrayTransform = (val) => {
  if (Array.isArray(val)) return val;
  return val.split(',').map((s) => s.trim());
};

export function findValidatorSchema(
  schema: ZodTypeAny,
  path: string,
): ZodTypeAny | null {
  const keys = path.split('.');
  let currentSchema: ZodTypeAny = schema;

  for (const key of keys) {
    if (currentSchema instanceof ZodObject) {
      const shape = currentSchema.shape;
      if (!(key in shape)) {
        return null; // key not found
      }
      currentSchema = shape[key];
    } else {
      // Current schema is not an object, so no further nested path possible
      return null;
    }
  }

  return currentSchema; // leaf schema at path if found
}

export function hasLeafKey(schema: ZodTypeAny, path: string): boolean {
  const keys = path.split('.');
  let currentSchema: ZodTypeAny = schema;

  for (const key of keys) {
    if (currentSchema instanceof ZodObject) {
      const shape = currentSchema.shape;
      if (!(key in shape)) {
        return false; // key does not exist
      }
      currentSchema = shape[key];
    } else {
      // Current schema is not an object, so cannot have nested keys
      return false;
    }
  }

  return true; // found leaf key path
}

export function flattenObject(
  obj: Record<string, any>,
  prefix = '',
  sep = '.',
): Record<string, any> {
  let result: Record<string, any> = {};
  _.forOwn(obj, (value, key) => {
    const newKey = prefix ? `${prefix}${sep}${key}` : key;
    if (_.isObject(value) && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  return result;
}

export function flattenZodSchema(
  schema: ZodTypeAny,
  prefix = '',
  sep = '.',
): Record<string, ZodTypeAny> {
  const result: Record<string, ZodTypeAny> = {};

  if (schema instanceof ZodObject) {
    const shape = schema.shape;
    for (const key in shape) {
      const newKey = prefix ? `${prefix}${sep}${key}` : key;
      Object.assign(result, flattenZodSchema(shape[key], newKey, sep));
    }
  } else {
    result[prefix] = schema;
  }

  return result;
}
