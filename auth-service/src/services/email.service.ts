import nodemailer from 'nodemailer';

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);

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
    console.warn(`[EMAIL] SMTP is not configured; email was not sent to ${to}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `Authentication System <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    throw new Error('Email delivery failed');
  }
};