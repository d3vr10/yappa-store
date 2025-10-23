import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BulkInsertProductDtoInput, InsertOneProductDtoInput, FindManyProductsQueryDtoInput, UpdateProductDtoInput, DeleteManyProductDtoInput, UpdateManyProductsDtoInput } from "./products.dto";
import { ProductsService } from "./products.service";
import { ObjectIdParamDto } from "../shared/shared.dto";
import { DeleteManyCategoryDtoInput } from "./categories.dto";

@Controller('products')
export class ProductsController {

    constructor(
        private productSrv: ProductsService,
    ) { }

    @Get(':id')
    async findProductById(
        @Param() params: ObjectIdParamDto,
    ) {
        const { id } = params
        const result = await this.productSrv.findProductById(id)
        return result
    }

    @Get()
    async findManyProducts(
        @Query() queryParams: FindManyProductsQueryDtoInput
    ) {
        const { page, perPage, keywords } = queryParams
        const result = await this.productSrv.findManyProducts({ page, perPage, keywords })
        return result
    }

    @Post()
    async insertOneProduct(
        @Body() payload: InsertOneProductDtoInput,
    ) {
        const result = await this.productSrv.insertOneProduct(payload)
        return result
    }

    @Post('bulk')
    async insertManyProducts(
        @Body() payload: BulkInsertProductDtoInput,
    ) {
        const result = await this.productSrv.insertManyProducts(payload)
        return result
    }

    @Patch(':id')
    async updateOneProduct(
        @Param() params: ObjectIdParamDto,
        @Body() payload: UpdateProductDtoInput,
    ) {
        const { id } = params
        const result = await this.productSrv.updateOneProduct(id, payload)
        return result
    }

    @Patch()
    async updateManyProducts(
        @Body() payload: UpdateManyProductsDtoInput,
    ) {
        const { ids, attrs } = payload
        const result = await this.productSrv.updateManyProducts(ids, attrs)
        return result
    }


    @Delete('bulk')
    async deleteManyProducts(
        @Body() payload: DeleteManyProductDtoInput,
    ) {
        const result = await this.productSrv.deleteManyProducts(payload)
        return result
    }

    @Delete(':id')
    async deleteOneProduct(
        @Param() params: ObjectIdParamDto
    ) {
        const { id } = params
        const result = await this.productSrv.deleteManyProducts([id])
        return result
    }



    @Get(':id/reviews')
    async getProductReviews(
        @Param() params: ObjectIdParamDto,
    ) {
        const { id } = params
        const result = await this.productSrv.getProductReviews(id)
        return result
    }

    // @Get(':id/reviews')
    // async findManyProductReviews(
    //     @Param() params: any,
    // ) {

    // }

    @Post(':id/reviews')
    @HttpCode(HttpStatus.MULTI_STATUS)
    async insertManyProductReviews(
        @Param() params: ObjectIdParamDto,
        @Body() payload: any,
        @Query() query: any,
    ) {
        const { id } = params
        const result = await this.productSrv.insertManyProductReviews(id, payload, { bulkOp: true })
        return result
    }

    @Patch(':prodId/reviews/:reviewId')
    async updateOneProductReview(
        @Param() params: any,
        @Body() payload: any,
    ) {

    }


    @Delete(':prodId/reviews/:reviewId')
    async deleteOneProductReview(
        @Param() params: any,
    ) {

    }

    @Delete(':id/reviews')
    async deleteManyProductReviews(
        @Param() params: ObjectIdParamDto,
        @Body() payload: any,
    ) {
        const { id } = params
    }


}