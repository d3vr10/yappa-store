import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { UserDocument } from "../users/users.types";
import { Model } from "mongoose";
import { User } from "../users/users.model";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@/core/config/config.service";
import { randomUUID } from "crypto";
import { InjectModel } from "@nestjs/mongoose";
import { UserJwtPayload } from "./auth.types";
import { AuthException } from "@/core/errors/errors.http";
import { errorCodes } from "@/core/errors/errors.codes";
import { AuthController } from "./auth.controller";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userMdl: Model<User>,
        private jwtSrv: JwtService,
        private configSrv: ConfigService,
    ) { }

    async invalidateRefreshToken(userId: string) {
        const res = await this.userMdl.findByIdAndUpdate(userId, {
            refreshToken: null,
        }, { new: true, runValidators: true, strict: true, })
    }

    async refreshTokens(refreshToken: string) {
        const payload = await this.jwtSrv.verifyAsync(refreshToken, {
            issuer: this.configSrv.get('basic.externalUrl'),
            secret: this.configSrv.get('security.jwt.refreshToken.secret'),
        }) as UserJwtPayload

        if (payload.type !== 'refresh') {
            throw new AuthException({
                errorCode: errorCodes.auth.invalidCreds.code,
                details: {
                    reason: 'JWT Payload type is wrong'
                },
                message: 'Invalid credentials',
                statusCode: HttpStatus.FORBIDDEN,
            })
        }

        const instance = await this.userMdl.findById(payload.sub)
        if (!instance) {
            throw new AuthException({
                errorCode: errorCodes.auth.invalidCreds.code,
                details: {
                    reason: `User with id ${payload.sub} doesn't exist`
                },
                message: 'Invalid token',
                statusCode: HttpStatus.UNAUTHORIZED,
            })
        }
        const doc = instance.toObject()
        if (doc.refreshToken !== payload.jti) {
            throw new AuthException({
                errorCode: errorCodes.auth.invalidCreds.code,
                details: {
                    reason: `Refresh token identifiers don't match`,
                },
                message: 'Invalid credentials',
                statusCode: HttpStatus.UNAUTHORIZED,
            })
        }

        const creds = await this.generateToken(instance)
        return creds
    }

    async generateToken(user: UserDocument) {
        const jti = randomUUID()
        const accessToken = await this.jwtSrv.signAsync({
            sub: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin,
            type: 'access',
        }, {
            expiresIn: this.configSrv.get('security.jwt.expiresIn'),
            algorithm: this.configSrv.get('security.jwt.algo') as 'HS256',
            secret: this.configSrv.get('security.jwt.secret'),
            issuer: this.configSrv.get('basic.externalUrl'),
        })

        const refreshToken = await this.jwtSrv.signAsync({
            sub: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin,
            jti,
            type: 'refresh',
        }, {
            algorithm: this.configSrv.get('security.jwt.algo') as 'HS256',
            expiresIn: this.configSrv.get('security.jwt.refreshToken.expiresIn'),
            issuer: this.configSrv.get('basic.externalUrl'),
            secret: this.configSrv.get('security.jwt.refreshToken.secret'),
        })

        await this.userMdl.findByIdAndUpdate(user._id.toString(), { refreshToken: jti }, {
            runValidators: true,
            strict: true,
            timestamps: true
        })

        return {
            accessToken,
            refreshToken,
        }
    }

}