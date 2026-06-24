const dotenv = require('dotenv');
dotenv.config();

const sendEmail = require('./sendEmail');

(async () => {
  try {
    const to = process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;
    console.log(`Attempting to send test email to ${to} using host ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    await sendEmail({
      email: to,
      subject: 'ResuMatch SMTP Test Email',
      message: 'This is a test email sent from ResuMatch using the configured SMTP settings.'
    });
    console.log('Test email attempt finished. Check inbox and spam.');
    process.exit(0);
  } catch (err) {
    console.error('Test send error:', err);
    process.exit(1);
  }
})();
