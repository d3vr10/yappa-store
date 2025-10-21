import { ConfigSchema } from '@/core/config/config.types';
import _, { merge } from 'lodash';
import parseYAMLArgs from '@/core/config/config-yaml';
import getDefaultConfig from '@/core/config/config.default-configs';
import { configSchema } from '@/core/config/config.schema';
import 'dotenv';
import parseEnvArgs from '@/core/config/config.env';
import { ConfigService } from './config.service';

function collectConfig(inputConfig?: Partial<ConfigSchema>) {
  const envArgs = parseEnvArgs();
  const defaultArgs: any = getDefaultConfig();
  const yamlArgs = parseYAMLArgs(
    inputConfig?.basic?.config ||
      envArgs?.config?.path ||
      defaultArgs?.config?.path,
  );

  const mergedUserConfig = _.merge(yamlArgs, envArgs, inputConfig ?? {}); //merge user configs
  // const defaultConfigs = getDefaultConfig(mergedUserConfig) //build default configs
  return _.merge(mergedUserConfig); //merge user configs with defaults and return final config object
}

export function getConfigSingleton() {
  let config: ConfigSchema | undefined = undefined;
  return (inputConfig?: Partial<ConfigSchema>): ConfigSchema => {
    if (config !== undefined) {
      if (typeof inputConfig === 'object') {
        console.warn(
          '⚠️ getConfigSingleton is already initialized. Ignoring new config input.',
        );
      }

      return config;
    }
    const parsed = configSchema.safeParse(collectConfig(inputConfig));
    if (parsed.success) {
      config = parsed.data;
      return config;
    } else {
      console.error('❌ Invalid configuration:');
      throw parsed.error;
      //   parsed.error.issues.forEach((issue) => {
      //     const path = issue.path.join(".");
      //     const envVar = pathToEnvVarMap[path] || "(unknown)";
      //     console.error(`• ${envVar} (${path}) - ${issue.message}`);
      //   });
      //   process.exit(1);
    }
  };
}

export const getConfig = getConfigSingleton();
export const externalConfigSrv = new ConfigService(getConfig());
