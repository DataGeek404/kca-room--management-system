
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendBookingConfirmation(booking, user) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Booking Confirmation - KCA Room Management',
      html: `
        <h2>Booking Confirmed</h2>
        <p>Dear ${user.name},</p>
        <p>Your room booking has been confirmed:</p>
        <ul>
          <li><strong>Room:</strong> ${booking.room_name}</li>
          <li><strong>Title:</strong> ${booking.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.start_time).toLocaleString()} - ${new Date(booking.end_time).toLocaleString()}</li>
          <li><strong>Building:</strong> ${booking.building}</li>
          <li><strong>Floor:</strong> ${booking.floor}</li>
        </ul>
        <p>Please arrive on time and ensure the room is left in good condition.</p>
        <p>Best regards,<br>KCA Room Management System</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
    }
  }

  async sendMaintenanceNotification(request, maintenanceStaff) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: maintenanceStaff.map(staff => staff.email).join(','),
      subject: 'New Maintenance Request - KCA Room Management',
      html: `
        <h2>New Maintenance Request</h2>
        <p>A new maintenance request has been submitted:</p>
        <ul>
          <li><strong>Room:</strong> ${request.room_name}</li>
          <li><strong>Issue:</strong> ${request.issue}</li>
          <li><strong>Priority:</strong> ${request.priority.toUpperCase()}</li>
          <li><strong>Reported by:</strong> ${request.reported_by_name}</li>
          <li><strong>Description:</strong> ${request.description || 'N/A'}</li>
        </ul>
        <p>Please address this request as soon as possible.</p>
        <p>Best regards,<br>KCA Room Management System</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Maintenance notification sent');
    } catch (error) {
      console.error('Failed to send maintenance notification:', error);
    }
  }

  async sendBookingCancellation(booking, user) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Booking Cancelled - KCA Room Management',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your room booking has been cancelled:</p>
        <ul>
          <li><strong>Room:</strong> ${booking.room_name}</li>
          <li><strong>Title:</strong> ${booking.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.start_time).toLocaleString()} - ${new Date(booking.end_time).toLocaleString()}</li>
        </ul>
        <p>If you have any questions, please contact the administration.</p>
        <p>Best regards,<br>KCA Room Management System</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send booking cancellation email:', error);
    }
  }
}

module.exports = new EmailService();
