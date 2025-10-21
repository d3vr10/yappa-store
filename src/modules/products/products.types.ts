import { HydratedDocument } from "mongoose";
import { Product } from "./products.models";
import z from "zod";
import { createProductSchemaInput, updateProductSchemaInput } from "./products.validators";

export type ProductDocument = HydratedDocument<Product>
export type CreateProductSchemaInputSchema = z.infer<typeof createProductSchemaInput>
export type UpdateProductSchemaInputSchema = z.infer<typeof updateProductSchemaInput>