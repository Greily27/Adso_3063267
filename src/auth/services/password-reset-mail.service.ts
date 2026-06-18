import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import config from '../../config';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);

  constructor(
    @Inject(config.KEY)
    private readonly configService: ConfigType<typeof config>,
  ) {}

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const { host, port, secure, user, password, from } =
      this.configService.mail;

    if (
      !host ||
      !user ||
      !password ||
      !from ||
      this.isPlaceholderSmtpConfig(user, password)
    ) {
      this.logger.error(
        `No se envio el correo de recuperacion porque falta configuracion SMTP. Enlace generado: ${resetUrl}`,
      );
      throw new Error('SMTP configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Recuperacion de contrasena',
      text: `Recibimos una solicitud para recuperar tu contrasena. Ingresa al siguiente enlace para crear una nueva: ${resetUrl}. Este enlace expira en 1 hora.`,
      html: this.buildPasswordResetEmailHtml(resetUrl),
    });
  }

  private buildPasswordResetEmailHtml(resetUrl: string): string {
    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Recuperacion de contraseña</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f3f6fb; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f6fb; padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);">
                  <tr>
                    <td style="background-color:#0f766e; padding:28px 32px; text-align:center;">
                      <div style="font-size:13px; letter-spacing:1.4px; text-transform:uppercase; color:#ccfbf1; font-weight:700;">
                        Colegio Plinista
                      </div>
                      <h1 style="margin:10px 0 0; font-size:26px; line-height:1.25; color:#ffffff;">
                        Recuperacion de contrasena
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
                        Recibimos una solicitud para cambiar la contraseña de tu cuenta.
                      </p>
                      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
                        Haz clic en el siguiente boton para crear una nueva contraseña. Por seguridad, este enlace expira en 1 hora.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                        <tr>
                          <td style="border-radius:8px; background-color:#0f766e;">
                            <a href="${resetUrl}" style="display:inline-block; padding:14px 24px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:8px;">
                              Cambiar contrasena
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px; font-size:14px; line-height:1.6; color:#4b5563;">
                        Si el boton no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="margin:0; font-size:13px; line-height:1.6; word-break:break-all;">
                        <a href="${resetUrl}" style="color:#0f766e; text-decoration:underline;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                      <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
                        Si no solicitaste este cambio, puedes ignorar este correo.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private isPlaceholderSmtpConfig(user: string, password: string): boolean {
    return (
      user === 'correo@gmail.com' ||
      password === 'tu-app-password' ||
      password === 'pega-aqui-la-contrasena-de-aplicacion'
    );
  }
}
