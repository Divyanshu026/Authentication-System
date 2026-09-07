import crypto from 'crypto';
import argon2 from 'argon2';
import { findUserByEmail, updatePassword } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await findUserByEmail(email);
  
  // Silently return to prevent email enumeration attacks
  if (!user) return;

  // Generate a raw, secure 32-byte hex string
  const rawToken = crypto.randomBytes(32).toString('hex');
  
  // Hash it for database storage (SHA-256)
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Set expiration to 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Clear any existing reset tokens to prevent spam
  await deleteTokensByUserId(user.id, 'PASSWORD_RESET');

  // Save the hashed token
  await createToken(user.id, tokenHash, 'PASSWORD_RESET', expiresAt);

  // In production, you would call your email provider (SendGrid, AWS SES, etc.) here.
  console.log(`\n[EMAIL SIMULATION] To reset your password, use this token: ${rawToken}\n`);
};

export const executePasswordReset = async (rawToken: string, newRawPassword: string): Promise<void> => {
  // Hash the incoming token to look it up in the database
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  const tokenRecord = await findTokenByHash(tokenHash, 'PASSWORD_RESET');

  // Reject if it doesn't exist or if the current time is past expires_at
  if (!tokenRecord || new Date() > tokenRecord.expires_at) {
    throw new Error('Invalid or expired token');
  }

  // Hash the new password and update the database
  const newPasswordHash = await argon2.hash(newRawPassword);
  await updatePassword(tokenRecord.user_id, newPasswordHash);

  // Burn the token so it cannot be used again
  await deleteTokensByUserId(tokenRecord.user_id, 'PASSWORD_RESET');
};