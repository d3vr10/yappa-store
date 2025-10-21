import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({ timestamps: true, strict: 'throw' })
export class User {
    @Prop({ required: true })
    username!: string;
    @Prop({ required: true, unique: true })
    email!: string;
    @Prop({ required: false })
    password!: string;
    @Prop({ default: false })
    isAdmin!: boolean;
    @Prop({ unique: true, type: String, required: false  })
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User)