import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(
    process.env.SMTP_PORT || 587
);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;

if (
    !smtpHost ||
    !smtpUser ||
    !smtpPass ||
    !emailFrom
) {
    throw new Error(
        "SMTP email configuration is missing"
    );
}

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});

const sendVerificationEmail = async (
    email: string,
    name: string,
    token: string
) => {
    const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:3000";

    const verificationUrl =
        `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: "Verify your Lowmark email",
        text: `
Hi ${name},

Please verify your Lowmark email address by opening this link:

${verificationUrl}

This verification link expires in 30 minutes.

If you did not create a Lowmark account, you can ignore this email.
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify your Lowmark email</h2>

                <p>Hi ${name},</p>

                <p>
                    Please verify your email address to complete
                    your Lowmark account setup.
                </p>

                <p>
                    <a
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background: #4f46e5;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                        "
                    >
                        Verify Email
                    </a>
                </p>

                <p>
                    This verification link expires in 30 minutes.
                </p>

                <p>
                    If you did not create a Lowmark account,
                    you can ignore this email.
                </p>
            </div>
        `,
    });
};

const verifyConnection = async () => {
    await transporter.verify();
};

const sendPasswordResetEmail = async (
    email: string,
    name: string,
    rawToken: string
) => {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error("FRONTEND_URL not defined");
    }

    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset your Lowmark password",

        text: `Hi ${name},

        We received a request to reset your Lowmark password.

        Reset your password using this link:

        ${resetUrl}

        This link will expire in 30 minutes.

        If you did not request a password reset, you can safely ignore this email.

        Thanks,
        Lowmark`.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Reset your Lowmark password</h2>

                <p>Hi ${name},</p>

                <p>
                    We received a request to reset your Lowmark password.
                </p>

                <p>
                    <a
                        href="${resetUrl}"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#4f46e5;
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>This link will expire in 30 minutes.</p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

                <p>
                    Thanks,<br />
                    Lowmark
                </p>
            </div>
        `,
    });
};

const sendNotificationEmail = async (
    email: string,
    name: string,
    title: string,
    message: string,
    productId: number
) => {
    const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:3000";

    const productUrl =
        `${frontendUrl}/product/${productId}`;

    await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: `Lowmark: ${title}`,

        text: `
Hi ${name},

${message}

View product:
${productUrl}

Thanks,
Lowmark
        `.trim(),

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                line-height: 1.6;
            ">
                <h2>${title}</h2>

                <p>Hi ${name},</p>

                <p>
                    ${message}
                </p>

                <p>
                    <a
                        href="${productUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background: #4f46e5;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                        "
                    >
                        View Product
                    </a>
                </p>

                <p>
                    Thanks,<br />
                    Lowmark
                </p>
            </div>
        `.trim(),
    });
};

export default {
    sendVerificationEmail,
    verifyConnection,
    sendPasswordResetEmail,
    sendNotificationEmail
};