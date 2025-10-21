import { AuthException } from "@/core/errors/errors.http";
import { CanActivate, ExecutionContext, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { errorCodes } from "@/core/errors/errors.codes";

export class IsAdminGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
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
        if ('isAdmin' in req.user) {
            if (req.user.isAdmin === false) {
                throw new AuthException({
                    errorCode: errorCodes.auth.insufficientPermissions.code,
                    details: {
                        reason: 'User is not an administrator',
                    },
                    message: 'Insufficient permissions',
                    statusCode: HttpStatus.FORBIDDEN,
                })
            }
            return true
        } else {
            throw new AuthException({
                errorCode: errorCodes.auth.invalidJwtPayload.code,
                details: {
                    reason: 'Permission indicators are missing'
                },
                message: 'Malformed key payload',
                statusCode: HttpStatus.BAD_REQUEST,
            })
        }
    }
}

