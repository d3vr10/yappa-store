import z from "zod";
import { paginationSchema, withKeywordInput } from "../shared/shared.validators";

export const createProductReviewSchema = z.object({
    title: z.string().min(4),
    comment: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
})

export const updateProductReviewSchema = createProductReviewSchema.partial()

export const createProductSchemaInput = z.object({
    name: z.string().min(4),
    category: z.string(),
    images: z.string().url().array().default([]),
    stockCount: z.number().min(0).default(0),
    description: z.string().optional(),
    rating: z.number().min(0).max(5).default(0),
    brandLogo: z.string().url().optional(),
    brandName: z.string().optional(),
    price: z.number()
        .nonnegative()
        .refine((val) => {
            if (val.toString().includes('.')) {
                const precision = val.toString().split('.')[-1]
                return precision.length <= 2 && precision.length >= 1
            }
            return true
        }, 'Precision digits should be between 1 and 2 characters')
        .default(0),
})


export const findManyProdsInput = paginationSchema.merge(withKeywordInput).partial()


export const bulkCreateProductSchemaInput = createProductSchemaInput.array()


export const updateProductSchemaInput = createProductSchemaInput.partial()