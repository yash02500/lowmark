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

export default {
    sendVerificationEmail,
    verifyConnection,
};