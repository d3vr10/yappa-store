import { Body, Controller, Delete, Get, Inject, Logger, Param, Post, Put, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserCreateInputDto, UserUpdateInputDto } from "./users.schema";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { hashPassword } from "../auth/auth.utils";
import { QueryPaginationDto } from "../shared/shared.validators";

@Controller('users')
export class UsersController {
    constructor (
        private usersSrv: UsersService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private logger: Logger,
    ) {}
    
    @Get()
    async findUsers (@Query() query: QueryPaginationDto) {
        const { page, perPage } = query
        return this.usersSrv.findAll({ page, perPage })
    }

    @Get(':id')
    async findUserById(@Param('id') id: string) {
        return await this.usersSrv.findById(id)
    }



    @Post()
    async createUser(@Body() payload: UserCreateInputDto) {
        const res = await this.usersSrv.createUser(payload)
        return {
            success: true,
            data: res
        }
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() payload: UserUpdateInputDto) {
        const res = await this.usersSrv.updateUser(id, payload)
        return {
            success: true,
            message: `Updated user with email "${res?.email}" successfully!`
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        const res = await this.usersSrv.deleteUserById(id)
        return {
            success: true,
            message: `Deleted user with email "${id}" successfully!`
        }
    }
}
