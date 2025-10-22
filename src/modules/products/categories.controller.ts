import { Body, Controller, Delete, Get, Param, Post, Patch, Query } from "@nestjs/common";
import { ProductCategoriesService } from "./categories.service";
import { DeleteManyCategoryDtoInput, FindManyCategoryQueryDto, InsertManyCategoryDtoInput, InsertOneCategoryDtoInput, UpdateManyCategoryDtoInput, UpdateOneCategoryDtoInput } from "./categories.dto";
import { ObjectIdParamDto } from "../shared/shared.dto";

@Controller('categories')
export class ProductCategoriesController {
    constructor(private categoriesSrv: ProductCategoriesService) { }

    @Get()
    async findMany(
        @Query() query: FindManyCategoryQueryDto,
    ) {
        const { page, perPage, keywords } = query
        const result = await this.categoriesSrv.findMany({ page, perPage, keywords })
        return result
    }

    @Get(':id')
    async findOne(@Param() params: ObjectIdParamDto) {
        const { id } = params
        const result = await this.categoriesSrv.findById(id)
        return result
    }

    @Post()
    async insertOne(
        @Body() payload: InsertOneCategoryDtoInput,
    ) {
        const result = await this.categoriesSrv.insertOne(payload)
    }

    @Post('batch')
    async insertMany(
        @Body('') payload: InsertManyCategoryDtoInput,
    ) {
        const result = await this.categoriesSrv.insertMany(payload, { bulkOp: true })
        return result
    }


    @Patch(':id')
    async updateOne(
        @Param() params: ObjectIdParamDto,
        @Body() payload: UpdateOneCategoryDtoInput,
    ) {
        const { id } = params
        const result = await this.categoriesSrv.updateOne(id, payload)
        return result
    }

    @Patch()
    async updateMany(
        @Body() payload: UpdateManyCategoryDtoInput,
    ) {
        const { ids, attrs } = payload
        const result = await this.categoriesSrv.updateMany(ids, attrs)
        return result
    }

    // @Post()
    // async bulkWrite(
    //     @Body() payload: any,
    // ) {

    // }
    @Delete('batch')
    async deleteMany(@Body() payload: DeleteManyCategoryDtoInput) {
        const result = await this.categoriesSrv.deleteMany(payload)
        return result
    }

    @Delete(':id')
    async deleteOne(@Param() params: ObjectIdParamDto) {
        const { id } = params
        const result = await this.categoriesSrv.deleteMany([id])
        return result
    }



}