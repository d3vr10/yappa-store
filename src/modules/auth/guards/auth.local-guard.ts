import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LOCAL_STRATEGY_TYPE } from "../strategies/auth.local-strategy";
export const LOCAL_GUARD_TYPE = 'LOCAL_GUARD_TYPE'

@Injectable()
export class LocalGuard extends AuthGuard(LOCAL_STRATEGY_TYPE) {}