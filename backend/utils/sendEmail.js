const nodemailer = require('nodemailer');

/**
 * Utility to send email verification OTPs
 * @param {object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
  const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!isConfigured) {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SIMULATOR - NO SMTP SETTINGS IN .ENV]`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.message}`);
    console.log(`==================================================\n`);
    return;
  }

  // Create SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports (587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,   // 5 seconds
    socketTimeout: 5000      // 5 seconds
  });

  // Compose Email Options
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'ResuMatch ATS'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">${options.message}</div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Verification email successfully sent to ${options.email}. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${options.email}:`, error.message);
    // Print fallback so the test code doesn't crash
    console.log(`\n==================================================`);
    console.log(`[EMAIL SIMULATOR FALLBACK] Verification OTP for ${options.email}:`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.message}`);
    console.log(`==================================================\n`);
  }
};

module.exports = sendEmail;
