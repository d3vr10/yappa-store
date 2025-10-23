import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ONLY_ALPHANUMERIC_REGEX, PAGINATION_PER_PAGE } from "./shared.constants";

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

export const objectIdSchema = z.string().length(24)
export const objectIdListSchema = objectIdSchema.array()
export const objectIdParamSchema = z.object({ 
    id: objectIdSchema,
})

export class QueryPaginationDto extends createZodDto(paginationSchema) {}
export const keywordSchema = z.string()
    .regex(ONLY_ALPHANUMERIC_REGEX, 'keywords can only made of alphanumeric characters')
export const withKeywordInput = z.object({
    keywords: z.string()
        .transform((val) => decodeURIComponent(val)
            .split(',')
            .map((kw) => kw.trim())
        ).pipe(keywordSchema.array()),
});
