const nodemailer = require('nodemailer');

/**
 * Email service for sending emails
 * For development, we'll use a test account from Ethereal
 * In production, you would use a real email service like SendGrid, Mailgun, etc.
 */
const sendEmail = async (options) => {
  try {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER || testAccount.user,
        pass: process.env.EMAIL_PASS || testAccount.pass,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SwapKazi" <noreply@swapkazi.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log the preview URL for development
    console.log('Email sent:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (testAccount) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
