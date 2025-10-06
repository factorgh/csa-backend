import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.user ? { user: config.email.user, pass: config.email.password } : undefined
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!config.email.user) {
    // eslint-disable-next-line no-console
    console.log('[EMAIL MOCK]', { to, subject });
    return { mocked: true } as any;
  }
  return transporter.sendMail({ from: config.email.from, to, subject, html });
}
