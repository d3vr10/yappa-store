import { Controller, Delete, Get, Head, Param, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { DeleteObjectQueryDtoInput } from "./storage.dtos";
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'

@Controller('storage')
export class StorageController {
    constructor(
        private storageSrv: StorageService,
    ) { }

    @UseInterceptors(FilesInterceptor)
    @Post('buckets/:bucketName')
    async uploadFiles(
        @Param('bucketName') bucketName: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {

    }


    @Delete('buckets/:bucketName')
    async deleteBucket(@Param('bucketName') bucketName: string) {
        await this.storageSrv.deleteBucket(bucketName)
    }

    @Get('buckets')
    async listBuckets() {
        const result = await this.storageSrv.listBuckets()
        return result
    }

    @Get('buckets/:bucketName')
    async listBucketObjects(@Param('bucketName') bucketName: string) {
        const result = await this.storageSrv.listObjects(bucketName)
        return result
    }

    @Delete('buckets/:bucketName/:key')
    async deleteObject(
        @Param() params: any,
        @Query() query: DeleteObjectQueryDtoInput,
    ) {
        const { bucketName, key } = params
        const { permanently = false } = query
        await this.storageSrv.deleteObjects(bucketName, [{ key }], { permanently })
    }

}