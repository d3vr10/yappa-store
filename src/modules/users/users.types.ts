import { HydratedDocument } from "mongoose";
import { User } from "./users.model";

export type UserDocument = HydratedDocument<User>;