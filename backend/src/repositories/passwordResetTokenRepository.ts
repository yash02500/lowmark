import PasswordResetToken from "../models/passwordResetToken";

const createToken = async (data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
}) => {
    return await PasswordResetToken.create(data);
};

const findByTokenHash = async (tokenHash: string) => {
    return await PasswordResetToken.findOne({
        where: {
            tokenHash,
            usedAt: null,
        },
    });
};

const deleteByUserId = async (userId: number) => {
    return await PasswordResetToken.destroy({
        where: {
            userId,
        },
    });
};

const deleteById = async (id: number) => {
    return await PasswordResetToken.destroy({
        where: {
            id,
        },
    });
};

const markAsUsed = async (
    id: number,
    usedAt: Date
) => {
    return await PasswordResetToken.update(
        {
            usedAt,
        },
        {
            where: {
                id,
            },
        }
    );
};

export default {
    createToken,
    findByTokenHash,
    deleteByUserId,
    deleteById,
    markAsUsed,
};