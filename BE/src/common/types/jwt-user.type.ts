export type JwtUser = {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
};
