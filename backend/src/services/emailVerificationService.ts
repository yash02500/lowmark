import crypto from "crypto";

import authRepository from "../repositories/authRepository";
import emailVerificationTokenRepository from "../repositories/emailVerificationTokenRepository";
import emailService from "./emailService";

const TOKEN_EXPIRY_MINUTES = 30;

const hashToken = (token: string) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const createVerificationToken = async (
    userId: number,
    email: string,
    name: string
) => {
    // Remove previous verification tokens
    await emailVerificationTokenRepository.deleteByUserId(userId);
    const rawToken =crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();

    expiresAt.setMinutes(
        expiresAt.getMinutes() +
            TOKEN_EXPIRY_MINUTES
    );

    await emailVerificationTokenRepository.createToken({
        userId,
        tokenHash,
        expiresAt,
    });

    await emailService.sendVerificationEmail(
        email,
        name,
        rawToken
    );
};

const verifyEmail = async (rawToken: string) => {
    if (!rawToken) {
        throw new Error(
            "Verification token is required"
        );
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await emailVerificationTokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
        throw new Error(
            "Invalid verification token"
        );
    }

    const expiresAt = tokenRecord.getDataValue("expiresAt") as Date;

    if (expiresAt < new Date()) {
        await emailVerificationTokenRepository.deleteById(
            Number(
                tokenRecord.getDataValue("id")
            )
        );

        throw new Error("Verification token has expired");
    }

    const userId = Number(tokenRecord.getDataValue("userId"));

    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    await user.update({ emailVerified: true });

    await emailVerificationTokenRepository.deleteById(
        Number(
            tokenRecord.getDataValue("id")
        )
    );

    return {
        id: user.get("id"),
        name: user.get("name"),
        email: user.get("email"),
        emailVerified: true,
    };
};

const resendVerificationEmail = async (
    userId: number
) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (
        Boolean(user.get("emailVerified"))
    ) {
        throw new Error("Email is already verified");
    }

    await createVerificationToken(
        userId,
        user.get("email") as string,
        user.get("name") as string
    );
};

export default {
    createVerificationToken,
    verifyEmail,
    resendVerificationEmail,
};