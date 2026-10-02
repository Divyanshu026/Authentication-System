import nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError.js';

const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && emailFrom);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    throw new AppError('Email delivery is not configured', 503);
  }

  try {
    const info = await transporter.sendMail({
      from: `Authentication System <${emailFrom}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    throw new AppError('Email provider rejected the delivery request', 503);
  }
};