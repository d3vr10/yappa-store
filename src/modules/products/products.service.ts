import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./products.models";
import { Model, Query } from "mongoose";
import { ResourceException } from "@/core/errors/errors.http";
import { HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { errorCodes } from "@/core/errors/errors.codes";
import { OptionalPaginationParams } from "../shared/types";
import { paginateResult } from "../shared/shared";
import { PAGINATION_PER_PAGE } from "../shared/shared.constants";
import { CreateProductDtoInput, UpdateProductDtoInput } from "./products.dto";
import { ProductDocument, UpdateProductSchemaInputSchema } from "./products.types";
import { User } from "../users/users.model";
import { ok } from "assert";

export class ProductsService {
    constructor(
        @InjectModel(Product.name)
        private productMdl: Model<Product>,
        @InjectModel(User.name)
        private userMdl: Model<User>,
    ) { }

    async findById(id: string) {
        const result = await this.productMdl.findById(id).populate('category')
        if (!result) {
            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: 'Product not found',
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `Product with id ${id} wasn't found`,
                }
            })
        }
        return result.toObject()
    }

    async getProductReviews(id: string) {
        const { reviews } = await this.findById(id)
        return reviews
    }

    async findMany({
        page = 1,
        perPage = PAGINATION_PER_PAGE,
        mostRated = false,
        keywords,
    }: OptionalPaginationParams & {
        mostRated?: boolean;
        keywords?: string[];
    } = {}) {
        const effectiveSkip = perPage * (page - 1)

        let query = this.productMdl.find()
            .sort({ name: 'asc' })
            .skip(effectiveSkip)
            .limit(perPage)
            .populate('category')

        if (mostRated)
            query = query.sort({ rating: 'desc' })


        if (keywords) {
            const searchPattern = `(?=\b${keywords})\b`
            const filterQuery = {
                $or: [
                    { brandName: { $regex: searchPattern, $options: 'i' } },
                    { name: { $regex: searchPattern, $options: 'i' } },
                    { description: { $regex: searchPattern, $options: 'i' } },
                    { description: { $regex: searchPattern, $options: 'i' } },
                ],
            }
            query = query.where(filterQuery)
        }

        const result = await query

        return paginateResult(result, perPage, result.length, page)
    }

    async createMany(products: CreateProductDtoInput[]) {
        const result = await this.productMdl.insertMany(products)
        return result.map((doc) => doc.toObject()) as unknown as ProductDocument
    }

    async updateOne(id: string, payload: UpdateProductDtoInput) {
        const result = await this.productMdl.findByIdAndUpdate(id, payload)
        if (!result) {
            throw new ResourceException({
                message: 'Product not found',
                errorCode: errorCodes.resource.notFound.code,
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `Product with id ${id} not found.`
                }
            })
        }
        return result.toObject()
    }
    async deleteMany(prodIds: string[] = []) { 
        const result = await this.productMdl.deleteMany({ _id: { $in: prodIds }})
        if (result.deletedCount < prodIds.length) {
            
        }
        return { deletedCount: result.deletedCount }
    }



    // async updateMany(products: UpdateProductSchemaInputSchema[]) {
    //     const userNotFoundProds = await Promise.all(products.map(async (item) => {
    //         const user = await this.userMdl.findById(item.userId)
    //         if (!user) return item
    //     }))
    //     const updateProds = products.filter((item) => !(item in userNotFoundProds))
    //     const ops = updateProds.map((prod: any) => {
    //         const { _id, ...rest } = prod
    //         return {
    //             updateOne: {
    //                 filter: { _id },
    //                 update: { $set: { ...rest } },
    //                 upsert: false,
    //             }
    //         }
    //     })
    //     const result = await this.productMdl.bulkWrite(ops)
    //     if (!result.ok) {
    //         throw new InternalServerErrorException("Couldn't update product batch. Aborting!")
    //     }

    //     return {
    //         usersNotFound: 

    //     }
            
    // }
}