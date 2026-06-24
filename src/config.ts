/* 
    sirve para leer variables de entorno (.env)
    y ponerlas disponibles en toda la aplicación NestJS de forma ordenada y segura.
*/
import { registerAs } from "@nestjs/config"; 

export default registerAs('config', () => {
    return {
        dataBase: {
            name: process.env.POSTGRES_DB,
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10)
            // expiresIn: process.env.JWT_EXPIRES_IN,
        },
        mail: {
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT || '587', 10),
            secure: process.env.MAIL_SECURE === 'true',
            user: process.env.MAIL_USER,
            password: process.env.MAIL_PASSWORD,
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
        },
        auth: {
            resetPasswordBaseUrl:
                process.env.RESET_PASSWORD_BASE_URL ||
                'http://localhost:4200/auth/reset-password',
        },
    }
});
