/**
 * EduMind Email Service for Password Reset OTP
 */
export async function sendOtpEmail({ toEmail, otp, candidateName = 'Candidate' }) {
  console.log(`\n============================================================`);
  console.log(`[EduMind Mailer] 🔑 PASSWORD RESET OTP`);
  console.log(`[EduMind Mailer] Recipient: ${toEmail}`);
  console.log(`[EduMind Mailer] OTP Code:  ${otp}`);
  console.log(`[EduMind Mailer] Valid for: 10 minutes`);
  console.log(`============================================================\n`);

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      await transporter.sendMail({
        from: `"EduMind AI" <${emailUser}>`,
        to: toEmail,
        subject: `Your EduMind AI Password Reset OTP: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
            <h2 style="color: #6366f1; margin-top: 0;">EduMind AI Password Reset</h2>
            <p style="color: #cbd5e1; font-size: 14px;">Hello ${candidateName},</p>
            <p style="color: #cbd5e1; font-size: 14px;">You requested to reset your password. Use the following 6-digit verification OTP code:</p>
            <div style="background: #1e293b; padding: 18px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #4f46e5;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #a5b4fc; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
            <p style="color: #64748b; font-size: 11px;">EduMind AI — Smart Assessment & Computer-Based Testing Engine</p>
          </div>
        `
      });

      return { success: true, delivered: true, mode: 'smtp' };
    } catch (err) {
      console.warn('[EduMind Mailer] Failed sending via live SMTP, simulated fallback used:', err.message);
    }
  }

  return { success: true, delivered: false, mode: 'simulated' };
}
