import User from "../models/User";
import { RegisterInput } from "../validations/authValidation";
import RefreshToken from "../models/refreshToken";

const findUserEmail = async (email: string) => {
    return await User.findOne({
        where: { email },
    });
};

const createUser = async (userData: RegisterInput) => {
    return await User.create(userData);
};

const findUserById = async (id: number) => {
  return await User.findByPk(id);
};

const createRefreshToken = async (userId: number, token: string, expiresAt: Date) => {
  return await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });
};

const findRefreshToken = async (token: string) => {
  return await RefreshToken.findOne({
    where: { token },
  });
};

const deleteRefreshToken = async (token: string) => {
  return await RefreshToken.destroy({
    where: { token },
  });
};

export default {
    findUserEmail,
    createUser,
    findUserById,
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
};