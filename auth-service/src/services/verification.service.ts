import crypto from 'crypto';
import { findUserById } from '../repositories/user.repository.js';
import { markUserAsVerified } from '../repositories/user.repository.js';
import { createToken, findTokenByHash, deleteTokensByUserId } from '../repositories/token.repository.js';

export const generateVerificationToken = async (userId: string): Promise<void> => {
  const user = await findUserById(userId);
  if (!user || user.is_verified) return; // Don't generate if already verified

  // Generate a raw 32-byte hex string
  const rawToken = crypto.randomBytes(32).toString('hex');
  
  // Hash it for DB storage
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Set expiration to 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Clear old verification tokens to prevent clutter
  await deleteTokensByUserId(user.id, 'EMAIL_VERIFICATION');

  // Save to database
  await createToken(user.id, tokenHash, 'EMAIL_VERIFICATION', expiresAt);

  // Simulate sending the email
  console.log(`\n[EMAIL SIMULATION] Please verify your account: http://localhost:3000/auth/verify-email?token=${rawToken}\n`);
};

export const executeEmailVerification = async (rawToken: string): Promise<void> => {
  // Hash the incoming token
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Look it up in the database
  const tokenRecord = await findTokenByHash(tokenHash, 'EMAIL_VERIFICATION');

  // Reject if missing or expired
  if (!tokenRecord || new Date() > tokenRecord.expires_at) {
    throw new Error('Invalid or expired verification token');
  }

  // Mark the user as verified
  await markUserAsVerified(tokenRecord.user_id);

  // Burn the token immediately
  await deleteTokensByUserId(tokenRecord.user_id, 'EMAIL_VERIFICATION');
};