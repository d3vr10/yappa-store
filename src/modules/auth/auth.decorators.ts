import { Request } from "express"
import { createParamDecorator, applyDecorators, HttpStatus, UseGuards } from "@nestjs/common"
import { AuthException } from "@/core/errors/errors.http"
import { errorCodes } from "@/core/errors/errors.codes"
import { UserJwtPayload } from "./auth.types"
import { JwtGuard } from "./guards/auth.jwt-strategy"
import { IsAdminGuard } from "./guards/auth.is-admin"

export function RequireAuth() {
    return applyDecorators(
        UseGuards(JwtGuard,)
    )
}

export function RequireAdmin() {
    return applyDecorators(
        UseGuards(JwtGuard, IsAdminGuard)
    )
}

export const User = createParamDecorator((data, ctx) => {
    const httpCtx = ctx.switchToHttp()
    const req = httpCtx.getRequest() as Request
    if (!req.user) {
        throw new AuthException({
            errorCode: errorCodes.auth.notAuthenticated.code,
            message: "You haven't authenticated yet!",
            details: {
                reason: 'User is anonymous'
            },
            statusCode: HttpStatus.UNAUTHORIZED,
        })
    }

    return req.user as UserJwtPayload

})