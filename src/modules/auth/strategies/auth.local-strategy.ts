import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "@/modules/users/users.model";
import { Model } from "mongoose";
import { AuthException, ResourceNotFoundException } from "@/core/errors/errors.http";
import { verifyPassword } from "../auth.utils";

export const LOCAL_STRATEGY_TYPE = 'LOCAL_STRATEGY_TYPE'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY_TYPE) {
    constructor (
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {
        super({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        })
    }

    async validate(req: Request, email: string, password: string ) {
        const instance = await this.userModel.findOne({ email })
        if (!instance)
            throw new ResourceNotFoundException({ kind: 'User', id: email })
        const user = instance.toObject()
        const passwordsMatch = await verifyPassword(password, user.password)
        if (!passwordsMatch) return false
        return user
    }
}