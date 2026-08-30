import { Request,Response } from "express";
import { registerUser } from "../services/auth.services.js";
  
// zod validation for inputs


export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const {email,password} = req.body;
        if(!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Email and password are required"
            })
        }

        const newUser = await registerUser(email, password);
        return res.status(201).json({
            error: false,
            message: 'User registered successfully',
            data: newUser
        })
    } catch (error:any) {
        return res.status(400).json({
            error: true,
            message: error.message
        })
    }
}

