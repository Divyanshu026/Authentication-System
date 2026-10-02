import crypto from 'crypto';
import { findUserByEmail } from '../repositories/user.repository.js';
import { verifyUserEmail } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';
import { AppError } from '../utils/AppError.js';
import { sendEmail } from './email.service.js';


export const generateVerificationToken = async (email: string): Promise<void> => {
    const user = await findUserByEmail(email);
    if (!user || user.is_verified) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await deleteTokensByUserId(user.id, 'EMAIL_VERIFICATION');
    await createToken(user.id, tokenHash, 'EMAIL_VERIFICATION', expiresAt);

    const verificationUrl = new URL(
        '/verify-email',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    );
    verificationUrl.searchParams.set('token', rawToken);

    const htmlTemplate = `
        <h1>Verify Your Account</h1>
        <p>Click the button below to verify your email address.</p>
        <p><a href="${verificationUrl.toString()}">Verify email address</a></p>
        <p>This link expires in 24 hours.</p>`;

    await sendEmail(user.email, 'Verify your account', htmlTemplate);
};

export const executeEmailVerification = async (rawToken: string): Promise<void> => {
  // 1. Hash the incoming rawToken using SHA-256.
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // 2. Fetch the token from the database using findTokenByHash(tokenHash, 'EMAIL_VERIFICATION').
      const token = await findTokenByHash(tokenHash,'EMAIL_VERIFICATION');
  // 3. If token doesn't exist OR expires_at is in the past, throw an Error ('Invalid or expired token').
            if (!token || token.expires_at < new Date()) {
                throw new AppError('Invalid or expired verification token', 400);
            }
  // 4. Update the user's status in the database using verifyUserEmail(token.user_id).
      await verifyUserEmail(token.user_id);
  // 5. Delete all 'EMAIL_VERIFICATION' tokens for this user so the token cannot be reused.
      await deleteTokensByUserId(token.user_id,'EMAIL_VERIFICATION');
};