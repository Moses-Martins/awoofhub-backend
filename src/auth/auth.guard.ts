import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {secret: this.configService.get<string>('JWT_SECRET')});
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            }

        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'];
        if (!authHeader) return undefined;

        // Split the header into type and token
        const [type, token] = authHeader.split(' ');

        // Return the token only if it's a Bearer token
        return type === 'Bearer' ? token : undefined;
    }
}