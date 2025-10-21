import { ConfigService } from "@/core/config/config.service";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express"
import { Injectable } from "@nestjs/common";

export const JWT_STRATEGY_TYPE = 'JWT_STRATEGY_TYPE'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_TYPE) {
    constructor (
        private configSrv: ConfigService,
    ) {
        super({
            passReqToCallback: true,
            issuer: configSrv.get('basic.externalUrl'),
            secretOrKey: configSrv.get('security.jwt.secret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
    validate(req: Request, payload: any): any {
        return payload
    }
}