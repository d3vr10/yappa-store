import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductCategory } from "./products.models";
import { Model, Query } from "mongoose";
import { ResourceException, ResourceNotFoundException } from "@/core/errors/errors.http";
import { HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { errorCodes } from "@/core/errors/errors.codes";
import { OptionalPaginationParams } from "../shared/types";
import { paginateResult } from "../shared/shared";
import { PAGINATION_PER_PAGE } from "../shared/shared.constants";
import { InsertOneProductDtoInput, UpdateProductDtoInput } from "./products.dto";
import { ProductDocument, UpdateProductSchemaInputSchema } from "./products.types";
import { User } from "../users/users.model";
import { ok } from "assert";

export class ProductsService {
    constructor(
        @InjectModel(Product.name)
        private productMdl: Model<Product>,
        @InjectModel(User.name)
        private userMdl: Model<User>,
        @InjectModel(ProductCategory.name)
        private prodCategoryMdl: Model<ProductCategory>,
    ) { }

    private _mapInputProductDtoToDb(productDto: any) {
        const productData: any = { ...productDto }
        productData.category = productDto.categoryId
        delete productData.categoryId
        return productData
    }

    async findProductById(id: string, options: { dehydrated?: boolean } = {}) {
        const { dehydrated = true } = options
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
        return dehydrated
            ? result.toObject()
            : result

    }

    async getProductReviews(id: string) {
        const product = await this.findProductById(id)
        return product.reviews
    }

    async insertOneProduct(product: any) {
        const result = await this.insertManyProducts([product])
        return result
    }

    async insertManyProductReviews(id: string, reviews: any[], options: { bulkOp?: boolean }) {
        const { bulkOp = false } = options
        const product = await this.findProductById(id, { dehydrated: false })
        const rvwUserIdList = reviews.map((rw) => rw.userId)
        const foundUserIdsInDb: string[] = (
            await this.userMdl.find({ _id: { $in: rvwUserIdList } })
        ).map((user) => user._id.toString())
        const rvwUserIdSet = new Set(rvwUserIdList)
        const userIdsInDbSet = new Set(foundUserIdsInDb)
        const idDiffSet = rvwUserIdSet.difference(userIdsInDbSet)
        const notFoundUserIds = Array.from(idDiffSet)
        const invalidReviewIndexNumbers = reviews.reduce((acc, rvw, index, []) => {
            if (rvw.userId in idDiffSet) { acc.push(index) }
            return acc
        })
        const throwError = () => {

            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: ``,
                details: {
                    reason: `The following userIds were not Found`,
                    notFoundUserIds: notFoundUserIds,
                    reviewIndexNumbers: invalidReviewIndexNumbers,
                },
                statusCode: HttpStatus.NOT_FOUND,
            })
        }

        if (!bulkOp && idDiffSet.size > 0) throwError()
        const validRvws = reviews.filter((rvw) =>
            rvw.userId in userIdsInDbSet.intersection(rvwUserIdSet)
        )
        product.reviews.push(...validRvws)


        try {
            (product as any).save()
            const response: any = {
                inserted: validRvws.length,
            }
            if (validRvws.length > 0) {
                if (notFoundUserIds.length > 0) {
                    response.errors = {
                        invalidReviewIndexNumbers,
                        notFoundUserIds,
                    }
                }
                return response
            } else if (validRvws.length === 0 && notFoundUserIds.length === 0) {
                return response
            }

            throwError()
        } catch (err) {
            if (err.code === 11000) {
                // throw new ResourceException({
                //     errorCode: errorCodes.resource.alreadyExists.code,
                //     message: '',
                //     statusCode: HttpStatus.BAD_REQUEST,
                //     details: {
                //         reason: ``,

                //     }
                // })
            }
            throw err
        }
    }

    async findManyProducts({
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


        else if (keywords) {
            const searchPattern = keywords.map((kw) => `\\b${kw}\\b`).join('|')
            const filterQuery = {
                $or: [
                    { brandName: { $regex: searchPattern, $options: 'i' } },
                    { name: { $regex: searchPattern, $options: 'i' } },
                    { description: { $regex: searchPattern, $options: 'i' } },
                ],
            }
            query = query.where(filterQuery)
        }

        const result = await query.exec()

        return paginateResult(result, perPage, result.length, page)
    }

    async insertManyProducts(productsDto: InsertOneProductDtoInput[]) {
        const productsData = productsDto.map((prod) => this._mapInputProductDtoToDb(prod))
        const result = await this.productMdl.insertMany(productsData)
        return result.map((doc) => doc.toObject()) as unknown as ProductDocument
    }

    async updateOneProduct(id: string, payload: UpdateProductDtoInput) {
        const result = await this.productMdl.findByIdAndUpdate(id, payload, { new: true })
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

    async updateManyProducts(ids: string[], attrs: any) {
        const result = await this.productMdl.updateMany({ _id: { $in: ids } }, attrs)
        const products = await this.productMdl.find({ _id: { $in: ids } })

        return {
            matched: result.matchedCount,
            modified: result.modifiedCount,
            items: products,
        }
    }

    async deleteManyProducts(ids: string[] = []) {
        const result = await this.productMdl.deleteMany({ _id: { $in: ids } })
        if (result.deletedCount < ids.length) {

        }
        return { deletedCount: result.deletedCount }
    }

    async deleteOneProduct(id: string) {
        const result = await this.deleteManyProducts([id])
        return result
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