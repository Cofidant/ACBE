const nodemailer = require('nodemailer')
const catchAsync = require('./catchAsync')
const pug = require('pug')
const path = require('path')
const { htmlToText } = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name?.split(' ')[0]
    this.from = `Anonymous Confidant <${process.env.EMAIL_FROM}>`
    this.url = url || 'https://anonymous-confidant.com'
  }

  myCreateTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      })
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    })
  }

  async send(template, subject, params = {}) {
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...params,
      }
    )

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    }

    await this.myCreateTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'YOU HAVE SAFELY LANDED!!')
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link (Expires in 15 minutes)'
    )
  }
  async sendAppointmentNotification(appointment) {
    await this.send('appointmentNotice', 'SESSION SCHEDULED', { appointment })
  }
  async sendReservationNotice(therapist) {
    await this.send('reservationNotice', 'MEET YOUR THERAPIST', { therapist })
  }
  async sendReservationExpired() {
    await this.send('reservationExpired', 'Reservation Expired')
  }
  async sendPaymentSuccessful(session) {
    await this.send('paymentSuccessful', 'PAYMENT SUCCESSFUL', {
      plan: session.subscriptionPlan,
    })
  }
}
