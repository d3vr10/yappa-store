import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { LocalStrategy } from "./strategies/auth.local-strategy";
import { LocalGuard } from "./guards/auth.local-guard";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule } from "@/core/config/config.module";
import { ConfigService } from "@/core/config/config.service";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./guards/auth.jwt-strategy";
import { JwtStrategy } from "./strategies/auth.jwt-strategy";

@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            useFactory: (configSrv: ConfigService) => {
            return {
                signOptions: {
                    algorithm: configSrv.get('security.jwt.algo') as 'HS256',
                    issuer: configSrv.get('basic.externalUrl'),
                },
            }    
            
            },
            inject: [ConfigService],
        }),
    ],
    providers: [
        LocalStrategy,
        LocalGuard,
        AuthService,
        JwtGuard,
        JwtStrategy,
    ],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}