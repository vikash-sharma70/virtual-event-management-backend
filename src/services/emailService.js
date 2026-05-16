const nodemailer = require("nodemailer")
const AppError = require("../utils/AppError")

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Virtual Events <noreply@virtualevents.com>",
      to,
      subject,
      text,  
      html,  
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent to ${to}: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`❌ Email failed to ${to}: ${error.message}`)
  }
}

const sendRegistrationConfirmation = async ({ user, event }) => {
  const eventDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const subject = `✅ Registration Confirmed: ${event.title}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .event-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .badge { background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully registered for the following event:</p>
          
          <div class="event-card">
            <h2>${event.title}</h2>
            <span class="badge">Confirmed</span>
            <br><br>
            <p><strong>📅 Date:</strong> ${eventDate}</p>
            <p><strong>⏰ Time:</strong> ${event.time}</p>
            <p><strong>📍 Location:</strong> ${event.location}</p>
            <p><strong>📝 Description:</strong> ${event.description}</p>
          </div>

          <p>Please save this information for your records.</p>
          <p>We look forward to seeing you at the event!</p>
          
          <p>Best regards,<br>
          <strong>Virtual Events Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Registration Confirmed!
    
    Hi ${user.name},
    
    You have successfully registered for: ${event.title}
    
    Date: ${eventDate}
    Time: ${event.time}
    Location: ${event.location}
    
    Best regards,
    Virtual Events Team
  `

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  })
}

const sendWelcomeEmail = async ({ user }) => {
  const subject = `Welcome to Virtual Events, ${user.name}! 🎉`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { padding: 20px; }
        .role-badge { 
          background: ${user.role === "organizer" ? "#F59E0B" : "#10B981"}; 
          color: white; padding: 4px 12px; border-radius: 20px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Virtual Events! 🎊</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your account has been created successfully!</p>
          <p>Your role: <span class="role-badge">${user.role}</span></p>
          ${
            user.role === "organizer"
              ? "<p>As an <strong>organizer</strong>, you can create and manage events.</p>"
              : "<p>As an <strong>attendee</strong>, you can browse and register for events.</p>"
          }
          <p>Get started now and explore virtual events!</p>
          <p>Best regards,<br><strong>Virtual Events Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Welcome to Virtual Events, ${user.name}! Your ${user.role} account has been created.`,
  })
}

module.exports = {
  sendEmail,
  sendRegistrationConfirmation,
  sendWelcomeEmail,
}