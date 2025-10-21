import { createZodDto } from "nestjs-zod";
import { bulkCreateProductSchemaInput, createProductSchemaInput, findManyProdsInput, updateProductSchemaInput } from "./products.validators";

export class CreateProductDtoInput extends createZodDto(createProductSchemaInput) {} 
export class BulkCreateProductDtoInput extends createZodDto(bulkCreateProductSchemaInput) {}
export class UpdateProductDtoInput extends createZodDto(updateProductSchemaInput) {}
export class FindManyProductsQueryDtoInput extends createZodDto(findManyProdsInput) {}