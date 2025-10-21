import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BulkCreateProductDtoInput, CreateProductDtoInput, FindManyProductsQueryDtoInput, UpdateProductDtoInput } from "./products.dto";
import { ProductsService } from "./products.service";

@Controller('products')
export class ProductsController {

    constructor (
        private productSrv: ProductsService,
    ) {}

    @Get(':id')
    async findProductById(
        @Param('id') id: string,
    ) {
        const result = await this.productSrv.findById(id)
        return result
    }

    @Get()
    async findMany(@Query() queryParams: FindManyProductsQueryDtoInput) {
        const { page, perPage } = queryParams
        const result = await this.productSrv.findMany({ page, perPage })
        return result
    }

    @Post()
    async createProduct(
        @Body() payload: BulkCreateProductDtoInput,
    ) {
        const result = await this.productSrv.createMany(payload)
        return result
    }

    @Put(':id')
    async updateProduct(
        @Param('id') id: string,
        @Body() payload: UpdateProductDtoInput,
    ) {
        const result = await this.productSrv.updateOne(id, payload)
        return result
    }

    @Delete(':id')
    async deleteProduct(
        @Param('id') id: string,
    ) {
        await this.deleteProduct(id)
    }

    @Get(':id/reviews')
    async getProductReviews(
        @Param('id')
        id: string,
    ) {
        return await this.productSrv.getProductReviews(id)
    }

}