import { Request, Response } from "express";
import authService from "../services/authService";
import { registerSchema } from "../validations/authValidation";

const register = async (req: Request, res: Response) => {
    try{
        const registerData = registerSchema.parse(req.body);

        const user = await authService.register(registerData);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    register,
}