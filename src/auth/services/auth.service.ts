import {
    BadRequestException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UserModel } from '../../users/interfaces/user';
import { PasswordResetMailService } from './password-reset-mail.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly forgotPasswordMessage = 'Si el correo existe, se enviara un enlace de recuperacion.';
    private readonly resetPasswordBaseUrl = 'http://localhost:4200/auth/reset-password';
    private readonly resetPasswordTokenExpiresInMs = 60 * 60 * 1000;

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly passwordResetMailService: PasswordResetMailService,
        // @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async validateUser(email: string, password: string) {
        const user: User = await this.usersService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(user: UserModel) {
        const payload = {
            sub: user.id,
            email: user.email,
            // roles: user.roles.map(r => r.name),
        };

        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOneByEmail(email);

        if (user) {
            const token = randomBytes(32).toString('hex');
            const tokenHash = this.hashPasswordResetToken(token);
            const expiresAt = new Date(Date.now() + this.resetPasswordTokenExpiresInMs);

            await this.usersService.savePasswordResetToken(user.id, tokenHash, expiresAt);
            try {
                await this.passwordResetMailService.sendPasswordResetEmail(
                    user.email,
                    `${this.resetPasswordBaseUrl}/${token}`,
                );
            } catch (error) {
                this.logger.error(
                    `No se pudo enviar el correo de recuperacion: ${error.message}`,
                );
            }
        }

        return {
            message: this.forgotPasswordMessage,
        };
    }

    async resetPassword(token: string, password: string) {
        const tokenHash = this.hashPasswordResetToken(token);
        const user = await this.usersService.findByPasswordResetToken(tokenHash);

        if (!user || !user.resetPasswordTokenExpires) {
            throw new BadRequestException('Token invalido o expirado');
        }

        if (user.resetPasswordTokenExpires.getTime() < Date.now()) {
            await this.usersService.clearPasswordResetToken(user.id);
            throw new BadRequestException('Token invalido o expirado');
        }

        await this.usersService.updatePasswordAndClearResetToken(user, password);

        return {
            message: 'Contrasena actualizada correctamente.',
        };
    }

    private hashPasswordResetToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    // async login(user: UserModel) {
    //     const payload = { sub: user.id, email: user.email };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }
    // auth.service.ts

    async checkStatus(user: UserModel) {
        const id = user.id;

        const dbUser = await this.usersService.findOne(id);
        if (!dbUser) throw new UnauthorizedException();

        // Usamos 'sub' para que la estrategia pueda encontrarlo después
        const payload = {
            sub: dbUser.id,
            email: dbUser.email
        };

        return {
            user: dbUser,
            access_token: this.jwtService.sign(payload), // Generamos el token con 'sub'
        };
    }
}
