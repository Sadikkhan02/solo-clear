import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "Solo Clear <noreply@soloclear.app>";
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Send Hunter Awakening / Email Verification link
 */
export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${BASE_URL}/verify?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #060813; color: #ffffff; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #0c1122; border: 1px solid rgba(79, 172, 254, 0.25); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px; }
          .badge { display: inline-block; background: rgba(79, 172, 254, 0.15); color: #4facfe; font-size: 11px; font-weight: bold; letter-spacing: 2px; padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(79, 172, 254, 0.3); text-transform: uppercase; margin-bottom: 12px; }
          .title { font-size: 24px; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.5px; }
          .message { font-size: 14px; line-height: 1.6; color: #a0aec0; margin-bottom: 28px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #0052d4, #4facfe); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(79, 172, 254, 0.4); text-transform: uppercase; }
          .footer { font-size: 11px; color: #4a5568; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 28px; font-family: monospace; }
          .token-box { background: #060813; border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 12px; color: #cbd5e0; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">SYSTEM NOTIFICATION</div>
            <h1 class="title">HUNTER AWAKENING</h1>
          </div>
          <p class="message">
            Greetings, Hunter. Your account registration has been registered in the Monarch System. 
            Confirm your identity within 24 hours to complete your awakening sequence.
          </p>
          <div class="btn-container">
            <a href="${verifyUrl}" class="btn" target="_blank">Verify System Access</a>
          </div>
          <p class="message" style="font-size: 12px; margin-bottom: 6px;">Or paste this verification link into your browser:</p>
          <div class="token-box">${verifyUrl}</div>
          <div class="footer">
            [SOLO CLEAR • MONARCH FITNESS SYSTEM] • DO NOT REPLY
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log("\n=======================================================");
    console.log("📨 [DEV / MOCK EMAIL] Verification Email Dispatched");
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log("=======================================================\n");
    return { success: true, mocked: true, verifyUrl };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "⚔️ [Solo Clear] Verify Your Hunter Awakening",
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Password Reset Recovery link
 */
export async function sendResetPasswordEmail(email, token) {
  const resetUrl = `${BASE_URL}/reset-password/confirm?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #060813; color: #ffffff; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #0c1122; border: 1px solid rgba(245, 101, 101, 0.25); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px; }
          .badge { display: inline-block; background: rgba(245, 101, 101, 0.15); color: #f56565; font-size: 11px; font-weight: bold; letter-spacing: 2px; padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(245, 101, 101, 0.3); text-transform: uppercase; margin-bottom: 12px; }
          .title { font-size: 24px; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.5px; }
          .message { font-size: 14px; line-height: 1.6; color: #a0aec0; margin-bottom: 28px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #c53030, #f56565); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 101, 101, 0.4); text-transform: uppercase; }
          .footer { font-size: 11px; color: #4a5568; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 28px; font-family: monospace; }
          .token-box { background: #060813; border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 12px; color: #cbd5e0; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">SYSTEM RECOVERY</div>
            <h1 class="title">PASSWORD RESET</h1>
          </div>
          <p class="message">
            Hunter, a request was received to reset your System access credentials. 
            This recovery link will expire in 1 hour. If you did not initiate this request, your account remains secure.
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="message" style="font-size: 12px; margin-bottom: 6px;">Or paste this recovery link into your browser:</p>
          <div class="token-box">${resetUrl}</div>
          <div class="footer">
            [SOLO CLEAR • MONARCH FITNESS SYSTEM] • DO NOT REPLY
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log("\n=======================================================");
    console.log("📨 [DEV / MOCK EMAIL] Password Reset Email Dispatched");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=======================================================\n");
    return { success: true, mocked: true, resetUrl };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "🔒 [Solo Clear] Reset Your Hunter Password",
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    return { success: false, error: error.message };
  }
}
