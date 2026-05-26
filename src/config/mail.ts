import nodemailer from "nodemailer";

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const mailService = {
  async send(options: SendMailOptions) {
    try {
      const from = process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@sms.local";
      
      const info = await transporter.sendMail({
        from,
        ...options,
      });

      console.log("Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }
  },

  // Send student account creation email with credentials
  async sendStudentCredentials(
    email: string,
    studentName: string,
    tempPassword: string,
    loginUrl: string
  ) {
    const subject = "🎓 Your Student Account Has Been Created";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h2 { margin: 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to School Management System 🎓</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>Congratulations! Your admission has been <strong>approved</strong> ✅</p>
              
              <p>Your student account has been created. Use the credentials below to log in:</p>
              
              <div class="credentials">
                <div class="field">
                  <div class="label">📧 Email (Username):</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">🔐 Temporary Password:</div>
                  <div class="value">${tempPassword}</div>
                </div>
              </div>
              
              <div class="warning">
                <strong> Important:</strong> This is a temporary password. After logging in, you must change it immediately to a secure password of your choice.
              </div>
              
              <p>
                <a href="${loginUrl}" class="button">Go to Dashboard →</a>
              </p>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click the button above or visit: <br><code>${loginUrl}</code></li>
                <li>Log in with your email and temporary password</li>
                <li>Change your password immediately</li>
                <li>Start using your student dashboard!</li>
              </ol>
              
              <p>If you have any issues, please contact the school administration.</p>
              
              <p>Best regards,<br><strong>School Management System</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to: email,
      subject,
      html,
    });
  },
};
