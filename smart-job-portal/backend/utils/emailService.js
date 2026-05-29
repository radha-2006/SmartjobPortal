const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

const emailTemplates = {
  applicationReceived: (applicantName, jobTitle, company) => ({
    subject: `Application Received – ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">Application Submitted Successfully!</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been received.</p>
        <p>You can track your application status on your dashboard.</p>
        <p style="color:#888;font-size:13px">Smart Job Portal Team</p>
      </div>`,
  }),

  statusUpdate: (applicantName, jobTitle, status) => ({
    subject: `Application Status Updated – ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">Application Status Update</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Your application for <strong>${jobTitle}</strong> status has been updated to: 
          <strong style="text-transform:capitalize">${status.replace('_', ' ')}</strong></p>
        <p>Log in to your dashboard for more details.</p>
        <p style="color:#888;font-size:13px">Smart Job Portal Team</p>
      </div>`,
  }),

  welcomeEmail: (name, role) => ({
    subject: 'Welcome to Smart Job Portal!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">Welcome to Smart Job Portal!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account as a <strong>${role}</strong> has been created successfully.</p>
        <p>Start ${role === 'jobseeker' ? 'exploring jobs' : 'posting opportunities'} today!</p>
        <p style="color:#888;font-size:13px">Smart Job Portal Team</p>
      </div>`,
  }),

  newApplication: (recruiterName, applicantName, jobTitle) => ({
    subject: `New Application – ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">New Application Received</h2>
        <p>Hi <strong>${recruiterName}</strong>,</p>
        <p><strong>${applicantName}</strong> has applied for <strong>${jobTitle}</strong>.</p>
        <p>Review the application in your recruiter dashboard.</p>
        <p style="color:#888;font-size:13px">Smart Job Portal Team</p>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
