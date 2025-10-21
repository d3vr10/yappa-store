import { createZodDto } from "nestjs-zod";
import z from "zod";
import { PAGINATION_PER_PAGE } from "./shared.constants";

export const paginationSchema = z.object({
    perPage: z.union([
        z.number().nonnegative(),
        z.string().transform((v) => Number(v)).pipe(z.number().nonnegative()),
    ]).default(PAGINATION_PER_PAGE),
    page: z.union([
        z.number().positive(),
        z.string().transform((v) => Number(v)).pipe(z.number().positive()),
    ]).default(1)
}).partial()

export class QueryPaginationDto extends createZodDto(paginationSchema) {}