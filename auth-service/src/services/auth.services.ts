import argon2 from 'argon2'
import { createUser, findUserByEmail } from '../repositories/user.repository.js'

export const registerUser = async (email:string, rawPassword:string)=> {
    // check for exisiting
    const existingUser = await findUserByEmail(email);
    if(existingUser) {
        throw new Error("Registration Failed. Please check your inputs");
    }

    const passwordHash = await argon2.hash(rawPassword);
    const user = await createUser(email,passwordHash);
    if(!user) {
        throw new Error("Failed to create user");
    }
    
    const { password_hash, ...safeUser } = user;
    return safeUser;
}