import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Observable, tap } from "rxjs";
import { Request } from "express";

@Injectable()
export class RequestInterceptor implements NestInterceptor{
    constructor (
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private logger: Logger
    ) {}
    intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const httpCtx = ctx.switchToHttp()
        const req = httpCtx.getRequest() as Request
        const res = httpCtx.getResponse() as Response
        return next.handle().pipe(
            tap(() => {

        const logRes = {
            ip: req.ip,
            user: req.user,
            path: req.path,
            statusCode: res.status,
            timestamp: (new Date()).toISOString(),
        }
                this.logger.log(JSON.stringify(logRes, null, 2), 'RequestInterceptor')
            })
        )
    }

}