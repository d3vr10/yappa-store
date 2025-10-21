import { NestFactory } from "@nestjs/core"
import { AppModule } from "./core/app/app.module"
import { ConfigService } from "./core/config/config.service"
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston"
import { ZodValidationPipe } from "nestjs-zod"
import { RequestInterceptor } from "./core/interceptors/global.interceptor"
import cookieParser from "cookie-parser"

async function main () {
    const nestApp = await NestFactory.create(AppModule)
    const configSrv = nestApp.get(ConfigService)
    const logger = nestApp.get(WINSTON_MODULE_NEST_PROVIDER)
    nestApp.useLogger(logger)
    nestApp.useGlobalPipes(new ZodValidationPipe())
    nestApp.listen(configSrv.get('basic.listenPort'))
    nestApp.useGlobalInterceptors(new RequestInterceptor(logger))
    nestApp.use(cookieParser())
}

main()