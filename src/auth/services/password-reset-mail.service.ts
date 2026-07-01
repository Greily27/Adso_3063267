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
    const { host, port, secure, user, password, from, brevoApiKey } =
      this.configService.mail;

    if (brevoApiKey) {
      await this.sendPasswordResetEmailWithBrevoApi(
        brevoApiKey,
        from,
        email,
        resetUrl,
      );
      return;
    }

    if (
      !host ||
      !user ||
      !password ||
      !from ||
      this.isPlaceholderSmtpConfig(user, password)
    ) {
      this.logger.error(
        'No se envio el correo de recuperacion porque falta configuracion SMTP.',
      );
      throw new Error('SMTP configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      auth: {
        user,
        pass: password,
      },
    });

    this.logger.log(
      `Intentando enviar correo de recuperacion. SMTP: ${host}:${port}. Secure: ${secure}. From: ${from}. To: ${email}`,
    );

    try {
      const info = await transporter.sendMail({
        from,
        to: email,
        subject: 'Recuperación de contraseña | I.E.T. Plinio Mendoza Neira',
        text: this.buildPasswordResetEmailText(resetUrl),
        html: this.buildPasswordResetEmailHtml(resetUrl),
      });

      this.logger.log(
        `Correo de recuperacion procesado para ${email}. Accepted: ${JSON.stringify(info.accepted ?? [])}. Rejected: ${JSON.stringify(info.rejected ?? [])}. Response: ${info.response}. Message ID: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo SMTP al enviar recuperacion a ${email}. ${this.getMailErrorDetails(error)}`,
      );
      throw error;
    }
  }

  private async sendPasswordResetEmailWithBrevoApi(
    apiKey: string,
    from: string | undefined,
    email: string,
    resetUrl: string,
  ): Promise<void> {
    if (!from) {
      this.logger.error(
        'No se envio el correo de recuperacion porque falta MAIL_FROM.',
      );
      throw new Error('MAIL_FROM is required');
    }

    this.logger.log(
      `Intentando enviar correo de recuperacion por Brevo API. From: ${from}. To: ${email}`,
    );

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: from,
          name: 'I.E.T. Plinio Mendoza Neira',
        },
        to: [{ email }],
        subject: 'Recuperación de contraseña | I.E.T. Plinio Mendoza Neira',
        textContent: this.buildPasswordResetEmailText(resetUrl),
        htmlContent: this.buildPasswordResetEmailHtml(resetUrl),
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      this.logger.error(
        `Fallo Brevo API al enviar recuperacion a ${email}. Status: ${response.status}. Response: ${responseBody}`,
      );
      throw new Error(
        `Brevo API request failed with status ${response.status}`,
      );
    }

    this.logger.log(
      `Correo de recuperacion procesado por Brevo API para ${email}. Response: ${responseBody}`,
    );
  }

  private getMailErrorDetails(error: unknown): string {
    if (!(error instanceof Error)) {
      return String(error);
    }

    const details = error as Error & {
      code?: string;
      command?: string;
      response?: string;
      responseCode?: number;
    };

    return [
      `message=${details.message}`,
      details.code ? `code=${details.code}` : undefined,
      details.command ? `command=${details.command}` : undefined,
      details.responseCode ? `responseCode=${details.responseCode}` : undefined,
      details.response ? `response=${details.response}` : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildPasswordResetEmailHtml(resetUrl: string): string {
    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Recuperación de contraseña</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f3f6fb; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f6fb; padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);">
                  <tr>
                    <td style="background-color:#0f766e; padding:28px 32px; text-align:center;">
                      <div style="font-size:13px; letter-spacing:1.4px; text-transform:uppercase; color:#ccfbf1; font-weight:700;">
                        I.E.T. Plinio Mendoza Neira
                      </div>
                      <h1 style="margin:10px 0 0; font-size:26px; line-height:1.25; color:#ffffff;">
                        Recuperación de contraseña
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
                        Hola, <strong>Usuario Colplinista</strong>:
                      </p>
                      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                      </p>
                      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
                        Haz clic en el siguiente botón para crear una nueva contraseña. Por seguridad, este enlace vence en una hora.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                        <tr>
                          <td style="border-radius:8px; background-color:#0f766e;">
                            <a href="${resetUrl}" style="display:inline-block; padding:14px 24px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:8px;">
                              Restablecer contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px; font-size:14px; line-height:1.6; color:#4b5563;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="margin:0; font-size:13px; line-height:1.6; word-break:break-all;">
                        <a href="${resetUrl}" style="color:#0f766e; text-decoration:underline;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                      <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
                        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
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

  private buildPasswordResetEmailText(resetUrl: string): string {
    return [
      'Hola, Usuario Colplinista:',
      '',
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
      `Utiliza el siguiente enlace para crear una nueva contraseña: ${resetUrl}`,
      '',
      'Por seguridad, este enlace vence en una hora.',
      'Si no solicitaste este cambio, puedes ignorar este correo de forma segura.',
    ].join('\n');
  }

  private isPlaceholderSmtpConfig(user: string, password: string): boolean {
    return (
      user === 'correo@gmail.com' ||
      password === 'tu-app-password' ||
      password === 'pega-aqui-la-contrasena-de-aplicacion'
    );
  }
}
