import { createZodDto } from "nestjs-zod";
import { objectIdParamSchema, objectIdSchema } from "./shared.validators";

export class ObjectIdParamDto extends createZodDto(objectIdParamSchema) {}