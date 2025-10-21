import { HttpException, HttpStatus } from "@nestjs/common";
import { errorCodes } from "./errors.codes";

export class ApiException extends HttpException {
    constructor ({ message, details, statusCode, errorCode }:{errorCode: string, message: string, details?: any, statusCode: HttpStatus}) {
        const payload: { [key: string]: any } = { error: {} }
        payload.error.message = message
        payload.error.timestamp = (new Date()).toISOString()
        payload.error.errorCode = errorCode
        if (details) payload.error.details = details
        super(payload, statusCode)
    }
}

export class ResourceNotFoundException extends ApiException {
    constructor({kind, id, message }: { message?: string, kind: string, id: string }) {
        super({
            message: message?? `${kind[0].toUpperCase() + kind.substring(1)} with id ${id} wasn't found`,
            statusCode: HttpStatus.NOT_FOUND,
            details: {
                reason: `Resource doesn't exist`,
            },
            errorCode: errorCodes.resource.notFound.code,
        })
    }
}

export class ResourceException extends ApiException {
    constructor (params: {
        errorCode: string;
        statusCode: HttpStatus;
        details: any;
        message: string;
    }) {
        super({
            errorCode: params.errorCode,
            statusCode: params.statusCode,
            details: params.details,
            message: params.message,
        })
    }
}

export class AuthException extends ApiException {
    constructor (params: { message?: string, errorCode: string, statusCode?: HttpStatus, details?: any }) {
        const payload: { [key: string]: any} = {
            message: params.message?? 'Invalid credentials',
            errorCode: params.errorCode?? errorCodes.auth.invalidCreds.code,
            statusCode: params.statusCode?? HttpStatus.UNAUTHORIZED,
        }
        if (params.details) payload.details = params.details
        super(payload as any)
    }
}

