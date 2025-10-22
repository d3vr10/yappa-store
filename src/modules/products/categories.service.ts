import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OptionalPaginationParams, PaginationParams } from "../shared/types";
import { ResourceException } from "@/core/errors/errors.http";
import { errorCodes } from "@/core/errors/errors.codes";
import { HttpStatus } from "@nestjs/common";
import { ProductCategory } from "./products.models";
import { paginateResult } from "../shared/shared";

export class ProductCategoriesService {
    constructor(
        @InjectModel(ProductCategory.name)
        private categoriesMdl: Model<ProductCategory>,
    ) { }

    async findMany(params: OptionalPaginationParams & { keywords?: string[] } = {}) {
        const { perPage = 10, page = 1, keywords = [] } = params
        const effectiveSkip = perPage * (page - 1)
        const effectiveLimit = perPage

        let query = this.categoriesMdl.find()
            .skip(effectiveSkip)
            .limit(effectiveLimit)

        if (keywords.length > 0) {
            const searchPattern = keywords.map((kw) => `\\b${kw}\\b`).join('|')
            query = query.where({
                $or: [
                    { name: { $regex: searchPattern, $options: 'i' } },
                    { description: { $regex: searchPattern, $options: 'i' } },
                ]
            })
        }

        const result = await query
        return paginateResult(result, perPage, result.length, page)

    }

    async findById(id: string) {
        const result = await this.categoriesMdl.findById(id)
        if (!result) {
            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: 'Category does not exist',
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `Category with id ${id} not found`
                }
            })
        }

        return result.toObject()
    }

    async insertOne(category: any) {
        try {
            const result = await this.categoriesMdl.insertOne(category)
            return result.toObject()
        } catch (err) {
            if (err.code === 11000) {
                throw new ResourceException({
                    errorCode: errorCodes.resource.alreadyExists.code,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Category already exist',
                    details: {
                        reason: 'Duplicate category was submitted',
                    }
                })
            }
        }
    }

    async insertMany(categories: any[], options: {
        bulkOp?: boolean,
    } = {}) {
        const { bulkOp = false } = options
        try {
            const result = await this.categoriesMdl.insertMany(categories, { ordered: !bulkOp })
            return result.map((item) => item.toObject())

        } catch (err) {
            if (err.code === 11000) {
                throw new ResourceException({
                    errorCode: errorCodes.resource.alreadyExists.code,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Category(ies) already exist',
                    details: {
                        reason: 'Duplicate category(ies) were submitted',
                        duplicatedDocsByIndex: err.writeErrors.filter((item) => item.err.code === 11000).map((item) => item.err.index),
                    }
                })
            }
            throw err
        }
    }

    async updateOne(id: string, category: any) {
        try {
            const result = await this.categoriesMdl.findByIdAndUpdate(id, category, { new: true })
            if (!result) {
                throw new ResourceException({
                    errorCode: errorCodes.resource.notFound.code,
                    message: 'Category does not exist',
                    statusCode: HttpStatus.NOT_FOUND,
                    details: {
                        reason: `Category with id ${id} not found`
                    }
                })
            }
            return result.toObject()
        } catch (err: any) {
            throw err
        }
    }

    async updateMany(categoryIds: string[], attrs: any) {
        const result = await this.categoriesMdl.updateMany({
            _id: {
                $in: categoryIds
            }
        },
            attrs,
            {
                upsert: false,
                
            }
        )

        const docs = await this.categoriesMdl.find({ _id: { $in: categoryIds }})

        return {
            modified: result.modifiedCount,
            matched: result.matchedCount,
            items: docs,
        }
    }

    async deleteOne(id: string) {
        const result = await this.deleteMany([id])
    }

    async deleteMany(ids: string[]) {
        try {
            const result = await this.categoriesMdl.deleteMany({ _id: { $in: ids } })
            return result
        } catch (err: any) {
            throw err
        }
    }

}