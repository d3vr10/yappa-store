import { ConfigSchema, ConfigPaths, PathValue } from './config.types';
import _ from 'lodash';
import { flattenObject } from './config.utils';

export class ConfigService {
  private config: ConfigSchema;
  private flattenedConfig: any;

  constructor(config: ConfigSchema) {
    this.config = config;
    this.flattenedConfig = flattenObject(config);
  }

  public getKeys() {
    return Object.keys(this.flattenedConfig);
  }

  public pick<P extends ConfigPaths<ConfigSchema>>(
    path: P,
  ): PathValue<ConfigSchema, P> {
    const value = _.get(this.config, path);
    return value as PathValue<ConfigSchema, P>;
  }

  public get<P extends ConfigPaths<ConfigSchema>>(
    path: P,
  ): PathValue<ConfigSchema, P> {
    // You can still use lodash.get internally if you want,
    // but you *assume* config is valid and the path exists.
    // const value = _.get(this.config, path);

    // return value as PathValue<ConfigSchema, P>;

    return this.flattenedConfig[path];
  }

  public set<P extends ConfigPaths<ConfigSchema>>(
    path: P,
    value: PathValue<ConfigSchema, P>,
    strict = false,
  ): void {
    if (!strict) {
      _.set(this.config, path, value);
      return;
    }
    // Strict mode: only set if intermediate path exists
    const keys = path.split('.');
    let curr: any = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (
        curr[keys[i]] === undefined ||
        typeof curr[keys[i]] !== 'object' ||
        curr[keys[i]] === null
      ) {
        throw new Error(
          `Strict set failed: path "${keys.slice(0, i + 1).join('.')}" does not exist or is not object`,
        );
      }
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
  }

  public getAll(): ConfigSchema {
    return this.config;
  }
}
