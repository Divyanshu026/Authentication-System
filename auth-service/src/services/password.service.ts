import crypto from 'crypto';
import argon2 from 'argon2';
import { findUserByEmail, updatePassword } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';
import { hex } from 'zod';
import { error } from 'console';
// Import redisClient or your deleteSession function to invalidate active logins

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
  
  // 8. Simulate email delivery by logging the RAW token to your terminal:
  // console.log(`[EMAIL SIMULATION] Reset link: http://localhost:3000/reset-password?token=${rawToken}`);
  console.log(`\n======================================================`);
  console.log(`[EMAIL SIMULATION] Password reset requested for ${email}`);
  console.log(`[EMAIL SIMULATION] Send this payload to /auth/reset-password:`);
  console.log(`{ "token": "${rawToken}" }`);
  console.log(`======================================================\n`);
};
 
export const executePasswordReset = async (rawToken: string, newRawPassword: string): Promise<void> => {
  // 1. Hash the incoming rawToken using SHA-256 (identical to step 4 above).
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // 2. Fetch the token from the database using findTokenByHash(hashedToken, 'PASSWORD_RESET').
      const token = await findTokenByHash(tokenHash, 'PASSWORD_RESET');
  // 3. If token doesn't exist OR expires_at is in the past, throw Error('Invalid or expired token').
      if(!token || token?.expires_at < new Date()) {
        throw  error('Invalid or expired token');
        return;
      }
  // 4. Hash the newRawPassword using argon2.hash().
      const newPasswordHash = await argon2.hash(newRawPassword);
  // 5. Update the user's password using updatePassword(token.user_id, newPasswordHash).
      await updatePassword(token.user_id, newPasswordHash);
  // 6. Delete the token (or all reset tokens for this user) so it cannot be reused.
      await deleteTokensByUserId(token.user_id,'PASSWORD_RESET');
  // 7. SECURITY: Destroy all active Redis sessions for this user so attackers are kicked out.
};