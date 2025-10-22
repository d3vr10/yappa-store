import { createZodDto } from "nestjs-zod";
import { insertOneCategoryInput, insertManyCategoryInput, updateOneCategoryInput, updateManyCategoryInput, deleteManyCategoryInput, findManyCategoryQuery } from "./categories.validators";

export class InsertOneCategoryDtoInput extends createZodDto(insertOneCategoryInput) {}
export class InsertManyCategoryDtoInput extends createZodDto(insertManyCategoryInput) {}
export class UpdateOneCategoryDtoInput  extends createZodDto(updateOneCategoryInput) {}
export class UpdateManyCategoryDtoInput  extends createZodDto(updateManyCategoryInput) {}
export class DeleteManyCategoryDtoInput extends createZodDto(deleteManyCategoryInput) {}
export class FindManyCategoryQueryDto extends createZodDto(findManyCategoryQuery) {}