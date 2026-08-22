import EmailVerificationToken from "../models/emailVerificationToken";

const createToken = async (data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
}) => {
    return await EmailVerificationToken.create(data);
};

const findByTokenHash = async (
    tokenHash: string
) => {
    return await EmailVerificationToken.findOne({
        where: {
            tokenHash,
        },
    });
};

const deleteByUserId = async (
    userId: number
) => {
    return await EmailVerificationToken.destroy({
        where: {
            userId,
        },
    });
};

const deleteById = async (
    id: number
) => {
    return await EmailVerificationToken.destroy({
        where: {
            id,
        },
    });
};

export default {
    createToken,
    findByTokenHash,
    deleteByUserId,
    deleteById,
};