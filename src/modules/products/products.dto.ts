import { createZodDto } from "nestjs-zod";
import { bulkInsertProductSchemaInput, createProductSchemaInput, findManyProdsInput, updateManyProductsInput, updateProductSchemaInput } from "./products.validators";
import { objectIdListSchema } from "../shared/shared.validators";

export class InsertOneProductDtoInput extends createZodDto(createProductSchemaInput) {} 
export class BulkInsertProductDtoInput extends createZodDto(bulkInsertProductSchemaInput) {}
export class UpdateProductDtoInput extends createZodDto(updateProductSchemaInput) {}
export class FindManyProductsQueryDtoInput extends createZodDto(findManyProdsInput) {}
export class DeleteManyProductDtoInput extends createZodDto(objectIdListSchema) {}
export class UpdateManyProductsDtoInput extends createZodDto(updateManyProductsInput) {}