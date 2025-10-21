import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigSchema } from '@/core/config/config.types';
import { ConfigService } from '@/core/config/config.service';
import { getConfig } from '@/core/config/config';

export const CONFIG_PROVIDER = Symbol('CONFIG_PROVIDER');

@Global()
@Module({})
export class ConfigModule {
  static forRoot(initialConfig?: Partial<ConfigSchema>): DynamicModule {
    const configuredProvider: Provider = {
      provide: CONFIG_PROVIDER,
      useFactory: () => getConfig(initialConfig),
    };

    const configServiceProvider: Provider = {
      provide: ConfigService,
      useFactory: (config: ConfigSchema) => new ConfigService(config),
      inject: [CONFIG_PROVIDER],
    };

    return {
      module: ConfigModule,
      providers: [configuredProvider, configServiceProvider],
      exports: [ConfigService],
    };
  }
}
