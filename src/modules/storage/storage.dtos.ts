import { createZodDto } from "nestjs-zod";
import { deleteObjectQueryInput } from "./storage.validators";

export class DeleteObjectQueryDtoInput extends (createZodDto(deleteObjectQueryInput)) {}