import crypto from "crypto";
import bcrypt from "bcrypt";
import authRepository from "../repositories/authRepository";
import passwordResetTokenRepository from "../repositories/passwordResetTokenRepository";
import emailService from "./emailService";

const TOKEN_EXPIRY_MINUTES = 30;

const hashToken = (token: string) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const requestPasswordReset = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findUserEmail(normalizedEmail);

    if (!user) {
        return;
    }

    const userId = Number(user.get("id"));
    const userEmail = user.get("email") as string;
    const userName = user.get("name") as string;

    await passwordResetTokenRepository.deleteByUserId(
        userId
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();

    expiresAt.setMinutes(
        expiresAt.getMinutes() +
        TOKEN_EXPIRY_MINUTES
    );

    await passwordResetTokenRepository.createToken({
        userId,
        tokenHash,
        expiresAt,
    });

    await emailService.sendPasswordResetEmail(
        userEmail,
        userName,
        rawToken
    );
};

const resetPassword = async (rawToken: string, newPassword: string) => {
    if (!rawToken) {
        throw new Error(
            "Password reset token is required"
        );
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
        throw new Error(
            "Invalid or expired password reset link"
        );
    }

    const expiresAt = tokenRecord.getDataValue("expiresAt") as Date;

    if (expiresAt < new Date()) {
        await passwordResetTokenRepository.deleteById(
            Number(
                tokenRecord.getDataValue("id")
            )
        );

        throw new Error(
            "Password reset link has expired"
        );
    }

    if (
        !newPassword ||
        newPassword.length < 8
    ) {
        throw new Error(
            "Password must be at least 8 characters"
        );
    }

    const userId = Number( tokenRecord.getDataValue("userId"));
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await user.update({password: hashedPassword});

    await authRepository.deleteRefreshTokensByUserId(userId);

    await passwordResetTokenRepository.markAsUsed(
        Number(
            tokenRecord.getDataValue("id")
        ),
        new Date()
    );

    await passwordResetTokenRepository.deleteByUserId(userId);
};

export default {
    requestPasswordReset,
    resetPassword,
};