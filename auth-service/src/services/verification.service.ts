import crypto from 'crypto';
import { findUserByEmail } from '../repositories/user.repository.js';
import { verifyUserEmail } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';
import { AppError } from '../utils/AppError.js';


export const generateVerificationToken = async (email: string): Promise<void> => {
  // 1. Fetch user by email.
        const user = await findUserByEmail(email);
  // 2. If user doesn't exist, OR if user.is_verified is already true, simply return.
      if(!user || user.is_verified) return;
  // 3. Generate a secure random token: crypto.randomBytes(32).toString('hex').
      const rawToken = crypto.randomBytes(32).toString('hex')
  // 4. Hash the token for DB storage (SHA-256).
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // 5. Calculate expiration date (e.g., 24 hours from now).
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // 6. Delete any existing 'EMAIL_VERIFICATION' tokens for this user via repository.
      await deleteTokensByUserId(user.id, 'EMAIL_VERIFICATION');
  // 7. Save the hashed token to the database using createToken() with type 'EMAIL_VERIFICATION'.
      await createToken(user.id,tokenHash,'EMAIL_VERIFICATION',expiresAt);
  // 8. Simulate email delivery by logging the RAW token to your console:
  // console.log(`[EMAIL SIMULATION] Verification link: http://localhost:3000/verify-email?token=${rawToken}`);
      console.log(`\n======================================================`);
      console.log(`[EMAIL SIMULATION] Verification email sent to ${email}`);
      console.log(`[EMAIL SIMULATION] Send this payload to /auth/verify-email:`);
      console.log(`{ "token": "${rawToken}" }`);
      console.log(`======================================================\n`);
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