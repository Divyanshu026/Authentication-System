import argon2 from 'argon2'
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository.js'
import { createSession, deleteSession, generateTokens, getSessionUserId } from './session.service.js';
import { generateVerificationToken } from './verification.service.js';
import { AppError } from '../utils/AppError.js';

export const registerUser = async (email:string, rawPassword:string)=> {
    // check for exisiting
    const existingUser = await findUserByEmail(email);
    if(existingUser) {
      throw new AppError("Registration Failed. Please check your inputs!", 409);
    }

    const passwordHash = await argon2.hash(rawPassword);
    const user = await createUser(email,passwordHash);
    if(!user) {
      throw new AppError("Failed to create user", 500);
    }
    
    const { password_hash, ...safeUser } = user;
    await generateVerificationToken(safeUser.email);
    return safeUser;
}

export const loginUser = async (email: string, rawPassword: string, metadata: any) => {
  // 1. Fetch user by email via repository.
    const user = await findUserByEmail(email);
  // 2. If user doesn't exist, throw a generic error ("Invalid email or password").
    if(!user) throw new AppError("Invalid email or password", 401);
  // 3. Verify the rawPassword against the user.password_hash using argon2.verify().
    const passwordHash = await argon2.hash(rawPassword);
    const isValidPassword = await argon2.verify(user.password_hash, rawPassword);
    
  // 4. If verification fails, throw the same generic error.
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }
  
  // 5. Call generateTokens(user.id).
    const { accessToken, refreshToken } =  generateTokens(user.id);
  // 6. Call createSession(user.id, refreshToken, metadata).
    await createSession(user.id,refreshToken,metadata)
  
  // 7. Return the tokens and the sanitized user object (no password hash).
    const { password_hash, ...safeUser} = user;
    
    return {
        accessToken,
        refreshToken,
        user: safeUser
    }
};

export const refreshUserSession = async (oldRawRefreshToken:string, metadata: any) => {
  // 1. Validate the old token and extract the userId from the JSON payload
    const userId = await getSessionUserId(oldRawRefreshToken);
    if (!userId) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
    // 2. Ensure user still exists in the primary database
    const user = await findUserById(userId);
    if (!user) {
    throw new AppError('User no longer exists', 401);
  }
  // 3. Destroy old session in Redis to prevent replay attacks
    await deleteSession(oldRawRefreshToken);

  // 4. Generate the new secrets
    const {accessToken:newAccessToken, refreshToken: newRawRefreshToken} = generateTokens(user.id);
    await createSession(user.id,newRawRefreshToken,metadata);
    
    return {newAccessToken,newRawRefreshToken};

}