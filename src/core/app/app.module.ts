import { Logger, Module } from "@nestjs/common";
import { MongooseModule, MongooseModuleOptions } from "@nestjs/mongoose";
import { ConfigService } from "../config/config.service";
import { LoggerModule } from "../logger/logger.module";
import { ConfigModule } from "../config/config.module";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { UsersModule } from "@/modules/users/users.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "@/modules/auth/auth.module";
import { ProductsModule } from "@/modules/products/products.module";
import { StorageModule } from "@/modules/storage/storage.module";

@Module({
    imports: [
        ConfigModule.forRoot(undefined),
        LoggerModule,
        MongooseModule.forRootAsync({
            useFactory: (configSrv: ConfigService, logger: Logger): MongooseModuleOptions => ({
                autoIndex: true,
                uri: configSrv.get('db.uri'),
                onConnectionCreate(connection) {
                    connection.on('connected', () => logger.log('Connected to Mongodb'))
                    connection.on('disconnected', () => logger.log('Disconnected from Mongodb'))
                    connection.on('reconnected', () => logger.log('Reconnected to Mongodb'))
                    connection.on('disconnecting', () => logger.log('Disconnecting from Mongodb'))
                    return connection
                },
            }),
            inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
            imports: [],

        }),
        UsersModule,
        ProductsModule,
        AuthModule,
        StorageModule,
        ThrottlerModule.forRoot({ throttlers: [
            {
                name: 'default',
                ttl: 5000,
                limit: 10,
            }
        ]}),
        
    ],
    providers: [
        {
            useClass: ThrottlerGuard,
            provide: APP_GUARD
        }
    ]
})
export class AppModule {}