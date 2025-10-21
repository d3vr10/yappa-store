import { Body, Controller, Delete, Get, Param, Post, Put as Patch, Query } from "@nestjs/common";
import { ProductCategoriesService } from "./categories.service";
import { DeleteManyCategoryDtoInput, InsertManyCategoryDtoInput, InsertOneCategoryDtoInput, UpdateManyCategoryDtoInput, UpdateOneCategoryDtoInput } from "./categories.dto";

@Controller('categories')
export class ProductCategoriesController {
    constructor (private categoriesSrv: ProductCategoriesService) {}

    @Get()
    async findMany(
        @Query() query: any,
    ) {
        const { page, perPage, keywords } = query
        const result = await this.categoriesSrv.findMany({ page, perPage, keywords })
        return result
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const result = await this.categoriesSrv.findById(id)
        return result
    }

    @Post()
    async insertOne(
        @Body() payload: InsertOneCategoryDtoInput, 
    ) {
        const result = await this.categoriesSrv.insertOne(payload)
    }

    @Post()
    async insertMany(
        @Body() payload: InsertManyCategoryDtoInput,
    ) {
        const result = await this.categoriesSrv.insertMany(payload)
        return result
    }


    @Patch(':id')
    async updateOne(
        @Param('id') id: string, 
        @Body() payload: UpdateOneCategoryDtoInput,
    ) {
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

    @Post()
    async bulkWrite(
        @Body() payload: any,
    ) {

    }

   @Delete(':id')
    async deleteOne(id: string) {
        const result = await this.categoriesSrv.deleteMany([id])
        return result
    }

    @Delete()
    async deleteMany(@Body() payload: DeleteManyCategoryDtoInput) {
        const result = await this.categoriesSrv.deleteMany(payload)
        return result
    }

}