import { createZodDto } from "nestjs-zod";
import z from "zod";
export const userCreateInputSchema = z.object({
    username: z.string(),
    email: z.string(),
    password: z.string().optional(),
    isAdmin: z.boolean().default(false),
})

export const userUpdateInputSchema = userCreateInputSchema.partial()
export class UserCreateInputDto extends createZodDto(userCreateInputSchema) {}
export class UserUpdateInputDto extends createZodDto(userUpdateInputSchema) {}
