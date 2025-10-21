import z from "zod/v3";


export const insertOneCategoryInput = z.object({
    name: z.string().min(1),
    description: z.string().default(''),
});
 

export const insertManyCategoryInput = insertOneCategoryInput.array()

export const updateOneCategoryInput = insertOneCategoryInput.partial()
export const updateManyCategoryInput = z.object({
    ids: z.string().array(),
    attrs: updateOneCategoryInput,
})

export const deleteManyCategoryInput = z.string().array()