// src/modules/config/config.types.ts

import { configSchema } from './config.schema';
import z from 'zod';

// Infer the main ConfigSchema type from the Zod schema.
export type ConfigSchema = z.infer<typeof configSchema>;

/**
 * Utility type to unwrap wrappers like ZodOptional, ZodNullable, ZodDefault, ZodEffects, and ZodUnion.
 * This is crucial for recursively traversing the schema.
 */
type UnwrapZodType<T> =
  T extends z.ZodOptional<infer U>
    ? UnwrapZodType<U>
    : T extends z.ZodNullable<infer U>
      ? UnwrapZodType<U>
      : T extends z.ZodDefault<infer U>
        ? UnwrapZodType<U>
        : T extends z.ZodEffects<infer U>
          ? UnwrapZodType<U>
          : T extends z.ZodUnion<infer U>
            ? UnwrapZodType<U>
            : T;

/**
 * Recursive type to build union of all dot-separated paths in an object (including intermediate objects).
 */
export type ConfigPaths<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: NonNullable<T[K]> extends object
        ? `${K}` | `${K}.${ConfigPaths<NonNullable<T[K]>>}`
        : `${K}`;
    }[Extract<keyof T, string>]
  : never;

// Check whether key K in T is optional (property includes undefined)
type IsOptionalKey<T, K extends keyof T> = undefined extends T[K]
  ? true
  : false;

// Recursively check if any key in P path through T is optional
type IsAnyPathOptional<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? IsOptionalKey<T, K> extends true
      ? true
      : IsAnyPathOptional<NonNullable<T[K]>, R>
    : false
  : P extends keyof T
    ? IsOptionalKey<T, P>
    : false;

/**
 * PathValue recursively resolves the type at path P inside T.
 * It returns the property's type *without* including `undefined` even if optional,
 * assuming Zod validation ensures presence of required properties.
 *
 * For your case, do NOT union with `undefined`, trust the Zod-validated schema.
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P] // no `| undefined` here, trusting Zod validation
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? NonNullable<T[K]> extends object
        ? PathValue<NonNullable<T[K]>, R>
        : never
      : never
    : never;
