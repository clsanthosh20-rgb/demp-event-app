import nodemailer from 'nodemailer';

const HOST = process.env.SMTP_HOST || '';
const PORT = Number(process.env.SMTP_PORT) || 587;
const SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : PORT === 465;
const USER = process.env.SMTP_USER || '';
const PASS = process.env.SMTP_PASS || '';
const FROM = process.env.MAIL_FROM || process.env.SMTP_FROM || 'noreply@demp.local';

function getTransporter() {
  if (!HOST) return null;
  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: SECURE,
    auth: USER ? { user: USER, pass: PASS } : undefined,
  });
}

function wrapTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a14;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#13132b 0%,#1a1a3e 100%);border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
<tr><td style="padding:40px 32px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
<h1 style="font-size:28px;font-weight:700;color:#f5f5f5;margin:0;letter-spacing:-0.5px;">DEMP</h1>
<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:4px 0 0;">Department Event Management Portal</p>
</td></tr>
<tr><td style="padding:32px;">
<h2 style="font-size:20px;font-weight:600;color:#f5f5f5;margin:0 0 20px;">${title}</h2>
<div style="color:rgba(255,255,255,0.75);line-height:1.7;font-size:15px;">${body}</div>
</td></tr>
<tr><td style="padding:24px 32px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
<p style="font-size:11px;color:rgba(255,255,255,0.25);margin:0;">This is an automated message from DEMP. Please do not reply directly.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

const templates = {
  registrationConfirmation: (userName: string, eventTitle: string, eventDate: string, eventTime: string, roomNumber: string, location: string, reportingTime: string, registrationId: string, qrDataUrl: string, organizerName: string, collegeName: string, qrPageLink: string) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: wrapTemplate(
      'Registration Confirmed',
      `<p style="margin:0 0 20px;">Dear <strong style="color:#f5f5f5;">${userName}</strong>,</p>
<p style="margin:0 0 16px;">Greetings from the Department Event Management Platform (DEMP)!</p>
<p style="margin:0 0 24px;">🎉 Congratulations! Your registration for <strong style="color:#818cf8;">${eventTitle}</strong> has been successfully confirmed. We are delighted to have you as a participant and look forward to your presence at the event.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:16px;padding:20px;margin:0 0 24px;">
<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:120px;">Event Name</td><td style="padding:8px 0;color:#f5f5f5;font-size:14px;font-weight:600;">${eventTitle}</td></tr>
<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Date</td><td style="padding:8px 0;color:#f5f5f5;font-size:14px;">${eventDate}</td></tr>
<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Time</td><td style="padding:8px 0;color:#f5f5f5;font-size:14px;">${eventTime}</td></tr>
<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Venue</td><td style="padding:8px 0;color:#f5f5f5;font-size:14px;">${location}${roomNumber ? `, Room ${roomNumber}` : ''}</td></tr>
<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Registration ID</td><td style="padding:8px 0;color:#818cf8;font-size:14px;font-weight:600;">${registrationId}</td></tr>
</table>
<p style="margin:0 0 16px;color:rgba(255,255,255,0.75);font-size:15px;">Your DEMP account has been successfully linked with this event registration. You can log in to your account at any time to view your registration details and access your unique QR code, which will be required during event check-in.</p>
<div style="text-align:center;margin:0 0 24px;">
<a href="${qrPageLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">View Your Registration QR Code</a>
</div>
<p style="margin:0 0 16px;color:rgba(255,255,255,0.75);font-size:15px;">Please keep your Registration ID and QR code ready on the day of the event for a smooth and quick entry.</p>
<p style="margin:0 0 16px;color:rgba(255,255,255,0.75);font-size:15px;">If you have any questions or require assistance, please contact the event coordinators or reply to this email.</p>
<p style="margin:0 0 24px;color:rgba(255,255,255,0.75);font-size:15px;">We wish you the very best and hope you have an enjoyable and enriching experience at <strong style="color:#f5f5f5;">${eventTitle}</strong>.</p>
<p style="margin:0 0 4px;color:rgba(255,255,255,0.75);font-size:15px;">Thank you for registering!</p>
<p style="margin:0;color:rgba(255,255,255,0.75);font-size:15px;">Warm regards,</p>
<p style="margin:8px 0 0;color:#f5f5f5;font-size:16px;font-weight:600;">DEMP Team</p>
<p style="margin:0;color:rgba(255,255,255,0.4);font-size:13px;">Department Event Management Platform</p>
<p style="margin:0;color:rgba(255,255,255,0.4);font-size:13px;">${collegeName}</p>`,
    ),
  }),
  eventCancelled: (userName: string, eventTitle: string) => ({
    subject: `Event Cancelled: ${eventTitle}`,
    html: wrapTemplate(
      'Event Cancelled',
      `<p style="margin:0 0 16px;">Hi ${userName},</p>
<p style="margin:0 0 16px;">We regret to inform you that <strong>${eventTitle}</strong> has been cancelled.</p>
<p style="margin:0;">We apologize for any inconvenience caused.</p>`,
    ),
  }),
  eventReminder: (userName: string, eventTitle: string, eventDate: string, location: string) => ({
    subject: `Reminder: ${eventTitle} is Tomorrow`,
    html: wrapTemplate(
      'Event Reminder',
      `<p style="margin:0 0 16px;">Hi ${userName},</p>
<p style="margin:0 0 16px;">This is a friendly reminder that <strong>${eventTitle}</strong> is happening soon!</p>
<p style="margin:0 0 8px;"><strong>Date:</strong> ${eventDate}</p>
<p style="margin:0 0 16px;"><strong>Location:</strong> ${location}</p>
<p style="margin:0;">Don't forget to attend!</p>`,
    ),
  }),
};

async function sendMail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP not configured. Would send to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
}

export const emailService = { sendMail, templates, getTransporter };
