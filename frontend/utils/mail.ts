import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // 587 uses STARTTLS
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY is not set. Email skipped.");
    return;
  }

  const from = process.env.MAIL_FROM || 'noreply@example.com';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: html || text,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

