import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserSchema } from "./users.model";
import { Model } from "mongoose";
import { exportRecord, exportRecords, paginateResult } from "../shared/shared";
import { hashPassword } from "../auth/auth.utils";
import { object } from "zod";
import { PAGINATION_PER_PAGE } from "../shared/shared.constants";
import { OptionalPaginationParams, PaginatedResult } from "../shared/types";
import { INTERCEPTORS_METADATA } from "@nestjs/common/constants";
import { ApiException, ResourceException } from "@/core/errors/errors.http";
import { errorCodes } from "@/core/errors/errors.codes";
import { urlencoded } from "express";


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private usersMdl: Model<User>
    ) { }

    async findAll({
        perPage = PAGINATION_PER_PAGE,
        page = 1,
        hideFields,
    }: OptionalPaginationParams & {
        hideFields?: boolean;
    } = {}) {
        const effectiveSkip = (page - 1) * perPage
        const [res, total] = await Promise.all([
            this.usersMdl.find()
                .sort({ email: 'asc' })
                .skip(effectiveSkip)
                .limit(perPage)
                .exec(),
            this.usersMdl.countDocuments({}),
        ])

        return paginateResult(res, perPage, total, page)
    }

    async findById(id: string) {
        const record = await this.usersMdl.findById(id)
        if (!record) {
            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: 'User not found',
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `User with id ${id} wasn't found`,
                }
            })
        }
        return record
    }

    async findByEmail(email: string) {
        const record = await this.usersMdl.findOne({ email, })
        if (!record) {
            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: 'User not found',
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `User with email ${email} wasn't found`,
                }
            })
        }
        return record
    }

    async createUser(user, hideFields = true) {
        const checkInstance = await this.usersMdl.findOne({ email: user.email })
        if (checkInstance)
            throw new ResourceException({
                errorCode: errorCodes.resource.alreadyExists.code,
                message: 'User already exists',
                statusCode: HttpStatus.BAD_REQUEST,
                details: {
                    reason: `Duplicate email found`
                }
            })
        if (user.password)
            user.password = await hashPassword(user.password)
        const res = await this.usersMdl.create(user)
        const instance = res.toObject()
        return instance
    }

    async updateUser(id: string, user, hideFields = true) {
        if (user.email) {
            const res = await this.usersMdl.findOne({ email: user.email })
                .countDocuments()
                .exec()
            if (res > 0)
                throw new ResourceException({
                    errorCode: errorCodes.resource.alreadyExists.code,
                    message: 'User already exists',
                    statusCode: HttpStatus.BAD_REQUEST,
                    details: {
                        reason: `Duplicate email ${user.email}`,
                    }
                })
        }
        let attrs = { ...user }

        if (attrs.password) {
            user.password = await hashPassword(user.password)
        }

        attrs = Object.fromEntries(
            Object.entries(user).filter(([k, v]) => v !== undefined)
        )

        try {

            const res = await this.usersMdl.findByIdAndUpdate(id, attrs, {
                runValidators: true,
                timestamps: true,
                new: true,
            })

            if (!res) {
                throw new ResourceException({
                    errorCode: errorCodes.resource.notFound.code,
                    message: `User with that id doesn't exist`,
                    statusCode: HttpStatus.NOT_FOUND,
                    details: {
                        reason: `User wasn't found`,
                    }
                })
            }
            return res.toObject()
        } catch (error) {
            if (error.name === 'CastError' && error.kind === 'ObjectId') {
                throw new ApiException({
                    errorCode: 'INVALID_RESOURCE_ID',
                    message: 'User Id either is malformed or does not exist in the system yet',
                    statusCode: HttpStatus.BAD_REQUEST,
                })
            } 
            throw error
        }
    }

    async deleteUserById(id: string) {
        const res = await this.usersMdl.findByIdAndDelete(id)
        if (!res) {
            throw new ResourceException({
                errorCode: errorCodes.resource.notFound.code,
                message: `User wasn't found`,
                statusCode: HttpStatus.NOT_FOUND,
                details: {
                    reason: `User with id ${id} doesn't exist`
                }
            })
        }
        return res
    }
}

