import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY_TYPE } from "../strategies/auth.jwt-strategy";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtGuard extends AuthGuard(JWT_STRATEGY_TYPE) {}