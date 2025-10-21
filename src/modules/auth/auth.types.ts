export type UserJwtPayload = {
    sub: string;
    email: string;
    isAdmin: boolean;
    type: 'access' | 'refresh';
    issuer: string;
    jti?: string;
}