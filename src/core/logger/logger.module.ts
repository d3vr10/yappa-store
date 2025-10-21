import { utilities as nestWinstonUtils } from 'nest-winston/dist/winston.utilities';
import { Global, Module } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '../config/config.service';
import winston from 'winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configSrv: ConfigService): WinstonModuleOptions => {
        const filterByContext = (allowedContext: string) => {
          return winston.format((info) => {
            if (info.context === allowedContext) {
              // Skip logs with this context for this transport
              return false;
            }
            // For all other logs, continue
            return info;
          })();
        };
        const effectiveEnv = (process.env.NODE_ENV ?? 'dev')
        const prodTransports =
           effectiveEnv === 'prod'
            ? [
                new winston.transports.File({
                  filename: 'logs/combined.log',
                  level: 'info',
                  format: winston.format.combine(winston.format.json()),
                }),
                new winston.transports.File({
                  filename: 'logs/error.log',
                  level: 'error',
                  format: winston.format.json(),
                }),
              ]
            : [];
        return {
          level: effectiveEnv === 'prod' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
          ),
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.ms(),
                nestWinstonUtils.format.nestLike('Xenix Admin', {
                  prettyPrint: true,
                  colors: true,
                  appName: true,
                  processId: true,
                }),
              ),
              level: process.env.NODE_ENV === 'prod' ? 'info' : 'silly',
            }),
            ...prodTransports,
            // databaseTransport,
          ],
        };
      },
    }),
  ],
  providers: [],
  controllers: [],
  exports: [WinstonModule],
})
export class LoggerModule {}
