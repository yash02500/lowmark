import User from "../models/User";
import { RegisterInput } from "../validations/authValidation";

const findUserEmail = async (email: string) => {
    return await User.findOne({
        where: { email },
    });
};

const createUser = async (userData: RegisterInput) => {
    return await User.create(userData);
};

export default {
    findUserEmail,
    createUser,
};