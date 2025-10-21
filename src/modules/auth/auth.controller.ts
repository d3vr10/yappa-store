import { Controller, HttpStatus, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LocalGuard } from "./guards/auth.local-guard";
import { Request, Response } from "express"
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_BOUND_PATH, REFRESH_TOKEN_COOKIE_NAME } from "./auth.constants";
import { User } from "./auth.decorators";
import { AuthService } from "./auth.service";
import { userCreateInputSchema } from "../users/users.schema";
import { UserDocument } from "../users/users.types";
import { ConfigService } from "@/core/config/config.service";
import ms from "ms";
import { AuthException } from "@/core/errors/errors.http";
import { errorCodes } from "@/core/errors/errors.codes";
import { UserJwtPayload } from "./auth.types";

@Controller('auth')
export class AuthController {
    constructor (
        private authSrv: AuthService,
        private configSrv: ConfigService,
    ) {}

    @UseGuards(LocalGuard)
    @Post('login')
    async login(
        @Req() req: Request, 
        @Res({ passthrough: true }) res: Response,
    ) {
        const creds = await this.authSrv.generateToken(req.user as UserDocument)
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, creds.refreshToken, {
            httpOnly: true,
            maxAge: ms(
                this.configSrv.get('security.jwt.refreshToken.expiresIn') as any,
            ) as any,
            path: REFRESH_TOKEN_BOUND_PATH,
            sameSite: 'lax',
        })
        return { 
            access_token: creds.accessToken,
        }
    }


    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @User() user: any,
    ) {
        await this.authSrv.invalidateRefreshToken(user.sub)
        res.clearCookie(ACCESS_TOKEN_COOKIE_NAME)
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME)

        return {
            success: true,
            message: 'Logged out!',
        }
    }

    @Patch('refresh-tokens')
    async refreshTokens (
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME] 
        if (!refreshCookie) {
            throw new AuthException({
                errorCode: errorCodes.auth.invalidCreds.code,
                details: {
                    reason: 'Missing refresh token in request',
                },
                message: 'Credentials are invalid',
                statusCode: HttpStatus.UNAUTHORIZED,
            })
        }

    
        const creds = await this.authSrv.refreshTokens(refreshCookie)
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, creds.refreshToken, {
            path: REFRESH_TOKEN_BOUND_PATH,
            httpOnly: true,
            maxAge: ms(
                this.configSrv.get('security.jwt.refreshToken.expiresIn') as any
            ) as any,
            sameSite: 'lax',
        })
        return {
            access_token: creds.accessToken,
        }
    }
}