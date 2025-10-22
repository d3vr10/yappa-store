import z from "zod";
import { objectIdSchema, paginationSchema, withKeywordInput } from "../shared/shared.validators";

export const findManyCategoryQuery = paginationSchema.merge(withKeywordInput).partial()
export const insertOneCategoryInput = z.object({
    name: z.string().min(1),
    description: z.string().default(''),
});
 

export const insertManyCategoryInput = insertOneCategoryInput.array()

export const updateOneCategoryInput = insertOneCategoryInput.partial()
export const updateManyCategoryInput = z.object({
    ids: objectIdSchema.array(),
    attrs: updateOneCategoryInput,
})

export const deleteManyCategoryInput = objectIdSchema.array()