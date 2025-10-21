export const errorCodes = {
    resource: {
        notFound: {
            code: 'RESOURCE_NOT_FOUND',
            msg: '',
        },
        alreadyExists: {
            code: 'RESOURCE_ALREADY_EXISTS',
            msg: '',
        }
    },
    auth: {
        invalidCreds: {
            code: 'AUTH_INVALID_CREDENTIALS',
            msg: '',
        },
        notAuthenticated: {
            code: 'AUTH_NOT_AUTHENTICATED',
            msg: '',
        },
        insufficientPermissions: {
            code: 'AUTH_INSUFFICIENT_PERMISSIONS',
            msg: '',
        },
        invalidJwtPayload: {
            code: 'AUTH_INVALID_AUTHENTICATION_PAYLOAD'
        }
    }
} as const