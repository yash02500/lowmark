import bcrypt from "bcrypt";
import authRepository from "../repositories/authRepository";
import { RegisterInput, registerSchema } from "../validations/authValidation";
import { getDefaultAutoSelectFamily } from "node:net";

const register = async (userData: RegisterInput) => {
    const existingUser = await authRepository.findUserEmail(userData.email);

    if(existingUser) {
        throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await authRepository.createUser({
        ...userData,
        password: hashedPassword,
    });

    return {
        id: newUser.get("id"),
        name: newUser.get("name"),
        email: newUser.get("email"),
        emailVerified: newUser.get("emailVerified"),
        createdAt: newUser.get("createdAt"),
    }
};

export default {
    register,
};