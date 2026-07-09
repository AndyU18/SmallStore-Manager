export declare class AuthService {
    login(loginDto: any): Promise<{
        accessToken: string;
    }>;
}
