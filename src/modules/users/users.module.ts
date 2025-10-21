import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./users.model";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

export const MONGOOSE_MODELS_MODULE = MongooseModule.forFeature([{
    name: User.name,
    schema: UserSchema,
}])

@Module({
    imports: [
        MONGOOSE_MODELS_MODULE,
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [MONGOOSE_MODELS_MODULE]
})
export class UsersModule {}