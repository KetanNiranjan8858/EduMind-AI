import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { hashPassword, verifyPassword, generateOTP, isValidGmail } from '../utils/security.js';
import { sendOtpEmail } from '../utils/mailer.js';

/**
 * 1. Sign Up (Candidate Registration)
 */
export async function signup(req, res) {
  try {
    const { name, email, password, candidateId, targetExam } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !isValidGmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Gmail address (@gmail.com) is required.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this Gmail address already exists. Please sign in.'
      });
    }

    const id = `usr_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const passwordHash = hashPassword(password);
    const finalCandidateId = candidateId && candidateId.trim()
      ? candidateId.trim()
      : `EDU-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTargetExam = targetExam && targetExam.trim()
      ? targetExam.trim()
      : 'GATE CS / IT';

    await db.query(
      'INSERT INTO users (id, name, email, password_hash, candidate_id, target_exam, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name.trim(), cleanEmail, passwordHash, finalCandidateId, finalTargetExam, 'local']
    );

    const role = cleanEmail.includes('admin') || cleanEmail === 'ketanniranjan996@gmail.com' ? 'admin' : 'student';

    const userProfile = {
      id,
      name: name.trim(),
      email: cleanEmail,
      candidateId: finalCandidateId,
      targetExam: finalTargetExam,
      authProvider: 'local',
      role
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: userProfile
    });
  } catch (err) {
    console.error('[Auth API] Signup error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create account.', error: err.message });
  }
}

/**
 * 2. Login (Password Protected)
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !isValidGmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail address (@gmail.com).'
      });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this Gmail address. Please create an account.'
      });
    }

    if (user.auth_provider === 'google' && !user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered with Google. Please use "Continue with Google".'
      });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. If you forgot your password, please use the Forgot Password link.'
      });
    }

    const userRole = user.role || (cleanEmail === 'ketanniranjan996@gmail.com' || cleanEmail.includes('admin') ? 'admin' : 'student');

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      candidateId: user.candidate_id,
      targetExam: user.target_exam,
      authProvider: user.auth_provider || 'local',
      role: userRole
    };

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: userProfile
    });
  } catch (err) {
    console.error('[Auth API] Login error:', err);
    return res.status(500).json({ success: false, message: 'Failed to log in.', error: err.message });
  }
}

/**
 * 3. Google Sign-In / Login with Gmail
 */
export async function googleLogin(req, res) {
  try {
    const { name, email, candidateId, targetExam } = req.body;

    if (!email || !isValidGmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Gmail address (@gmail.com) is required for Google Sign-In.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    let user = rows && rows[0];

    if (user) {
      const userRole = user.role || (cleanEmail === 'ketanniranjan996@gmail.com' || cleanEmail.includes('admin') ? 'admin' : 'student');
      // User already exists, log in
      return res.json({
        success: true,
        message: 'Logged in with Google successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          candidateId: user.candidate_id,
          targetExam: user.target_exam,
          authProvider: user.auth_provider,
          role: userRole
        }
      });
    }

    // New Google User
    const id = `usr_g_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const finalCandidateId = candidateId && candidateId.trim()
      ? candidateId.trim()
      : `EDU-G-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTargetExam = targetExam && targetExam.trim()
      ? targetExam.trim()
      : 'GATE CS / IT';
    const finalName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    const userRole = cleanEmail === 'ketanniranjan996@gmail.com' || cleanEmail.includes('admin') ? 'admin' : 'student';

    await db.query(
      'INSERT INTO users (id, name, email, password_hash, candidate_id, target_exam, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, finalName, cleanEmail, null, finalCandidateId, finalTargetExam, 'google']
    );

    return res.status(201).json({
      success: true,
      message: 'Google account created and signed in!',
      user: {
        id,
        name: finalName,
        email: cleanEmail,
        candidateId: finalCandidateId,
        targetExam: finalTargetExam,
        authProvider: 'google',
        role: userRole
      }
    });
  } catch (err) {
    console.error('[Auth API] Google login error:', err);
    return res.status(500).json({ success: false, message: 'Google sign-in failed.', error: err.message });
  }
}

/**
 * 4. Forgot Password - Request OTP to Registered Gmail
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidGmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid registered Gmail address (@gmail.com).'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered candidate account found with this Gmail address.'
      });
    }

    // Generate 6-digit OTP valid for 10 minutes
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [otp, expiresAt, cleanEmail]
    );

    // Send email
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp,
      candidateName: user.name
    });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      previewOtp: otp, // surfaced for immediate seamless testing
      expiresInMinutes: 10,
      mode: mailResult.mode
    });
  } catch (err) {
    console.error('[Auth API] Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process forgot password request.', error: err.message });
  }
}

/**
 * 5. Verify OTP
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (!user.otp_code || user.otp_code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code. Please check and try again.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new verification code.' });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully. You may now reset your password.'
    });
  } catch (err) {
    console.error('[Auth API] Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.', error: err.message });
  }
}

/**
 * 6. Reset Password with Verified OTP
 */
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (!user.otp_code || user.otp_code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const passwordHash = hashPassword(newPassword);

    await db.query(
      'UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL WHERE email = ?',
      [passwordHash, cleanEmail]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('[Auth API] Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password.', error: err.message });
  }
}
