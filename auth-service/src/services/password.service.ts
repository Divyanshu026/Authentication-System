import crypto from 'crypto';
import argon2 from 'argon2';
import { findUserByEmail, updatePassword } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';
import { AppError } from '../utils/AppError.js';
import { deleteAllUserSessions } from './session.service.js';
import { sendEmail } from './email.service.js';

export const requestPasswordReset = async (email: string): Promise<void> => {
  // 1. Fetch user by email.
    const user = await findUserByEmail(email);
  
  // 2. IMPORTANT: If user doesn't exist, simply return (do not throw an error). 
  // This prevents attackers from enumerating which emails are registered.
    if(!user) return;
  
  // 3. Generate a secure raw token (32 bytes of entropy) to use it as a secret key to authorize 
  // password reset: 
  // const rawToken = crypto.randomBytes(32).toString('hex');
    const rawToken = crypto.randomBytes(32).toString('hex');

  
  // 4. Hash the token for DB storage (SHA-256):
  // const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // 5. Calculate expiration date (e.g., 15 minutes from now).
    const expiresAt = new Date(Date.now() + 15*60*1000);
  
  // 6. Delete any existing 'PASSWORD_RESET' tokens for this user to prevent spam.
    
    await deleteTokensByUserId(user.id, 'PASSWORD_RESET');
  // 7. Save the hashed token to the database via createToken().
    await createToken(user.id, tokenHash, 'PASSWORD_RESET', expiresAt);
  
  await sendEmail(user.email, 'Password reset', `<p>Use this token to reset your password:</p><p>${rawToken}</p>`);
};
 
export const executePasswordReset = async (rawToken: string, newRawPassword: string): Promise<void> => {
  // 1. Hash the incoming rawToken using SHA-256 (identical to step 4 above).
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // 2. Fetch the token from the database using findTokenByHash(hashedToken, 'PASSWORD_RESET').
      const token = await findTokenByHash(tokenHash, 'PASSWORD_RESET');
  // 3. If token doesn't exist OR expires_at is in the past, throw Error('Invalid or expired token').
      if(!token || token?.expires_at < new Date()) {
        throw new AppError('Invalid or expired token', 400);
      }
  // 4. Hash the newRawPassword using argon2.hash().
      const newPasswordHash = await argon2.hash(newRawPassword);
  // 5. Update the user's password using updatePassword(token.user_id, newPasswordHash).
      await updatePassword(token.user_id, newPasswordHash);
  // 6. Delete the token (or all reset tokens for this user) so it cannot be reused.
      await deleteTokensByUserId(token.user_id,'PASSWORD_RESET');
  await deleteAllUserSessions(token.user_id);
};