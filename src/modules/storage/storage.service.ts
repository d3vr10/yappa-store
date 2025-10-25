import { ConfigService } from "@/core/config/config.service"
import { Bucket, BucketAlreadyExists, BucketCannedACL, CreateBucketCommand, DeleteBucketCommand, DeleteObjectsCommand, GetBucketInventoryConfigurationOutputFilterSensitiveLog, GetBucketPolicyCommand, GetBucketPolicyStatusCommand, GetBucketVersioningCommand, GetObjectCommand, HeadBucketCommand, ListBucketsCommand, ListObjectsV2Command, ListObjectVersionsCommand, ListObjectVersionsCommandOutput, NoSuchBucket, NotFound, ObjectCannedACL, PutBucketPolicyCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { S3_DELIMITER, S3_POLICY_LANGUAGE_VERSION, S3_PRIVATE_BUCKET_NAME, S3_PUBLIC_BUCKET_NAME, S3_ROOT_PREFIX } from "./storage.constants";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Readable } from "stream";
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class StorageService implements OnModuleInit {
    private s3Client: S3Client;
    private s3Endpoint: string;
    private abortControllersMap = new Map<string, AbortController>();

    constructor(
        private configSrv: ConfigService,
    ) {
        this.s3Client = new S3Client({
            region: configSrv.get('s3.region'),
            endpoint: configSrv.get('s3.endpoint'),
            forcePathStyle: this.configSrv.get('s3.forcePathStyle'),
            credentials: {
                accessKeyId: configSrv.get('s3.accessKeyId'),
                secretAccessKey: configSrv.get('s3.secretAccessKey'),
            },
        })
        this.s3Endpoint = this.configSrv.get('s3.endpoint')

    }

    private async _initBuckets() {
        await this.createBucket(S3_PUBLIC_BUCKET_NAME, { acl: 'public-read' })
        await this.createBucket(S3_PRIVATE_BUCKET_NAME, { acl: 'private' })
    }

    private _registerAbortController(uploadId: string) {
        const controller = new AbortController()
        this.abortControllersMap.set(uploadId, controller)
        return controller
    }


    async onModuleInit() {
        await this._initBuckets()
    }

    private _mapBucket(bucket: Bucket) {
        return {
            name: bucket.Name,
            createdAt: bucket.CreationDate,
            region: bucket.BucketRegion,
            arn: bucket.BucketArn,
        }
    }

    async listBuckets(options: {
        bucketNames?: string[];
        verbose?: boolean;
        status?: boolean;
        prefix?: string;
    } = {}) {
        const { prefix, bucketNames, status = true, verbose = true } = options
        try {
            let cmd = new ListBucketsCommand()
            let query = await this.s3Client.send(cmd)
            const response: { buckets: any[] } = {
                buckets: [],
            }
            if (query.Buckets) {
                for (const bucket of query.Buckets) {
                    if (!bucket.Name) continue
                    const data: any = this._mapBucket(bucket)
                    const policyDef = await this.getBucketPolicy(data.name)
                    data.policy = {
                        status: await this.getBucketPolicyStatus(data.name),
                        data: policyDef ? JSON.parse(policyDef) : null,
                    }

                    response.buckets.push(data)
                }
            }

            return response

        } catch (err) {
            throw err
        }
    }

    async listObjects(bucketName: string, options: { prefix?: string; delimiter?: string } = {}) {
        const { prefix, delimiter = S3_DELIMITER } = options
        const cmd = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            Delimiter: delimiter,
        })
        try {
            const response = await this.s3Client.send(cmd)
            return response.Contents
        } catch (err) {
            throw err
        }
    }


    async setBucketPublicReadOnly(bucketName: string) {
        // Define a public read-only bucket policy
        const policy = {
            Version: S3_POLICY_LANGUAGE_VERSION,
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${bucketName}/*`],
                },
            ],
        };


        try {
            await this.s3Client.send(
                new PutBucketPolicyCommand({
                    Bucket: bucketName,
                    Policy: JSON.stringify(policy),
                })
            );
        }
        catch (err) {
            throw err
        }
    }

    async downloadFile(key: string, bucketName: string) {
        const cmd = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        })
        try {
            const response = await this.s3Client.send(cmd)
            return {
                body: response.Body,
                mimetype: response.ContentType,
                size: response.ContentLength,
            }
        } catch (err) {
            throw err
        }
    }

    async createBucket(bucketName: string, options: {
        acl: BucketCannedACL;
    }) {
        const { acl = 'private' } = options
        const bckExists = await this.bucketExists(bucketName)
        try {
            if (!bckExists) {
                const cmd = new CreateBucketCommand({ Bucket: bucketName })
                const response = await this.s3Client.send(cmd)
                if (acl === 'public-read')
                    await this.setBucketPublicReadOnly(bucketName)
            }

        } catch (err) {
            throw err
        }
    }

    async deleteBucket(bucketName: string) {
        const cmd = new DeleteBucketCommand({ Bucket: bucketName })
        try {
            const response = await this.s3Client.send(cmd)
        } catch (err) {
            throw err
        }
    }

    async checkVersioning(bucketName: string) {
        try {
            const xmlRes = await this.s3Client.send(
                new GetBucketVersioningCommand({ Bucket: bucketName })
            )
            return xmlRes.Status
        } catch (err) {
            throw err
        }
    }

    async deleteObjects(bucketName: string, keys: { key: string, versionId?: string }[], options: {
        permanently?: boolean
    }) {
        const { permanently = false } = options
        const simpleDeleteObject = async () => {
            try {
                const response = await this.s3Client.send(
                    new DeleteObjectsCommand({
                        Bucket: bucketName,
                        Delete: {
                            Objects: keys.map(({ key, versionId }) => ({ Key: key, VersionId: versionId }))
                        },
                    })
                )
                return response
            } catch (err) {
                throw err
            }
        }

        if (!permanently) {
            return await simpleDeleteObject()

        } else {
            const bucketVersioning = await this.checkVersioning(bucketName)
            if (bucketVersioning === undefined)
                return await simpleDeleteObject()

            for (const { key } of keys) {
                try {
                    let versionsXml: ListObjectVersionsCommandOutput | undefined = undefined
                    do {
                        versionsXml = await this.s3Client.send(
                            new ListObjectVersionsCommand({
                                Bucket: bucketName,
                                Prefix: key,
                                KeyMarker: versionsXml ? versionsXml.NextKeyMarker : undefined,
                                VersionIdMarker: versionsXml ? versionsXml.NextVersionIdMarker : undefined,

                            })
                        )
                        if (versionsXml.Versions && versionsXml.Versions.length > 0) {
                            const versionsDelete = [
                                ...versionsXml.Versions
                                    .filter(({ Key, VersionId }) => Key !== undefined && VersionId !== undefined)
                                    .map(({ Key, VersionId }) => ({ Key, VersionId })),
                            ]

                            if (versionsXml.DeleteMarkers && versionsXml.DeleteMarkers.length > 0) {
                                versionsDelete.push(
                                    ...versionsXml.DeleteMarkers
                                        .filter(({ Key, VersionId }) => Key !== undefined && VersionId !== undefined)
                                        .map(({ Key, VersionId }) => ({ Key, VersionId }))
                                )
                            }

                            await this.s3Client.send(
                                new DeleteObjectsCommand({ Bucket: bucketName, Delete: { Objects: versionsDelete }, })
                            )

                        }
                    } while (versionsXml.IsTruncated)
                } catch (err) {
                    throw err
                }
            }
        }
    }

    async bucketExists(bucketName: string) {
        const cmd = new HeadBucketCommand({ Bucket: bucketName })
        try {
            await this.s3Client.send(cmd) ///asdad
            return true
        } catch (err) {
            if (err instanceof NotFound)
                return false
            throw err
        }
    }

    async getBucketPolicyStatus(bucketName: string) {
        const cmd = new GetBucketPolicyStatusCommand({
            Bucket: bucketName,
        })
        try {
            const response = await this.s3Client.send(cmd)
            return response?.PolicyStatus || null
        } catch (err) {
            if (err.message.includes('Deserialization error')) return null
            throw err
        }
    }

    async getBucketPolicy(bucketName: string) {
        const cmd = new GetBucketPolicyCommand({ Bucket: bucketName })
        try {
            const response = await this.s3Client.send(cmd)
            return response?.Policy || null
        } catch (err) {
            throw err
        }
    }

    private _mapFileMetaToS3Meta(meta: { filename?: string, mimetype?: string, size?: number, }) {
        return {
            'original-filename': meta.filename,
            'content-type': meta.mimetype,
            'content-length': meta.size,
        }
    }

    async putObject(bucketName: string, key: string, buffer: Buffer, meta: {
        filename: string,
        mimetype: string,
        size: number,
        tags?: string[],
    }) {
        try {
            const response = await this.s3Client.send(
                new PutObjectCommand({
                    Body: buffer,
                    Bucket: bucketName,
                    Key: key,
                    ContentType: meta.mimetype,
                    ContentLength: meta.size,
                })
            );

            return {
                url: new URL(`${bucketName}/${key}`, this.s3Endpoint).href,
                bucketName,
                key,
                filename: meta.filename,
                mimetype: meta.mimetype,
                size: response.Size ?? meta.size,
            }
        } catch (err) {
            throw err
        }
    }

    async multiPartUpload(bucketName: string, key: string, stream: Readable, meta: {
        filename: string,
        mimetype: string,
        size?: number,
        tags?: string[],
    }) {
        try {
            const upload = new Upload({ 
                client: this.s3Client,
                params: {
                    Bucket: bucketName,
                    Key: key,
                    Body: stream,
                    ContentType: meta.mimetype ?? 'octet-stream',
                    ContentLength: meta.size,
                },
            })
            const result = await upload.done()
            upload.uploadId
            return result

        } catch(err) {
            throw err
        }
    }


    //TODO to be implemented!
    async uploadFile(bucketName: string, key: string, payload: Buffer | Readable, meta: {
        filename: string,
        mimetype: string,
        size?: number,
    }) {
        
        throw new Error('To be Implemented!')
    }

}

