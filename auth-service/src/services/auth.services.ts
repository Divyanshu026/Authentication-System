import argon2 from 'argon2'
import { createUser, findUserByEmail } from '../repositories/user.repository.js'
import { createSession, generateTokens } from './session.service.js';
import { generateVerificationToken } from './verification.service.js';

export const registerUser = async (email:string, rawPassword:string)=> {
    // check for exisiting
    const existingUser = await findUserByEmail(email);
    if(existingUser) {
        throw new Error("Registration Failed. Please check your inputs!");
    }

    const passwordHash = await argon2.hash(rawPassword);
    const user = await createUser(email,passwordHash);
    if(!user) {
        throw new Error("Failed to create user");
    }
    
    const { password_hash, ...safeUser } = user;
    await generateVerificationToken(safeUser.email);
    return safeUser;
}

export const loginUser = async (email: string, rawPassword: string, metadata: any) => {
  // 1. Fetch user by email via repository.
    const user = await findUserByEmail(email);
  // 2. If user doesn't exist, throw a generic error ("Invalid email or password").
    if(!user) throw new Error("Login Failed. Please check your inputs!")
  // 3. Verify the rawPassword against the user.password_hash using argon2.verify().
    const passwordHash = await argon2.hash(rawPassword);
    const isValidPassword = await argon2.verify(user.password_hash, rawPassword);
    
  // 4. If verification fails, throw the same generic error.
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
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