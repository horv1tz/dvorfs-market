import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export class EmailService {
  static async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@dvorfs-market.com',
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  }

  static async sendOrderNotification(
    email: string,
    orderId: string,
    status: string
  ): Promise<void> {
    const subject = `Order ${status} - Order #${orderId}`;
    const html = `
      <h2>Order Update</h2>
      <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
      <p>Thank you for shopping with us!</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  static async sendPaymentNotification(
    email: string,
    orderId: string,
    amount: number,
    status: string
  ): Promise<void> {
    const subject = `Payment ${status} - Order #${orderId}`;
    const html = `
      <h2>Payment Update</h2>
      <p>Payment for order #${orderId} (${amount} USD) has been ${status}.</p>
      <p>Thank you for your purchase!</p>
    `;

    await this.sendEmail(email, subject, html);
  }
}

