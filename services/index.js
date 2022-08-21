const Session = require('../models/Session')
const Email = require('../utils/email')

const fifteenMinutes = 15 * 60 * 1000
const thirtyMinutes = fifteenMinutes * 2
const twoHours = thirtyMinutes * 4
const twenty4hours = twoHours * 12

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

// Delete Sessions That are reserved but not paid later than 24 hours
;(async function () {
  while (true) {
    try {
      await sleep(12000)
      const sessions = await Session.find({
        paymentStatus: 'pending',
      })
      for (const session of sessions) {
        // only those sessions later than 24 hours from date reserved
        if (session.createdAt.getTime() + twenty4hours <= Date.now()) {
          await Session.findByIdAndDelete(session._id)
          // Send Removal Email
          await new Email(session.patient).sendReservationExpired()
        }
      }
    } catch (error) {
      console.log('Error occured >>>>', error)
    }
  }
})()

// Send Notifications For Appointments that are due in 30 minutes
// mark appointments that are complete (two hrs 15 mins ahead of their start_time) as complete
;(async function () {
  while (true) {
    try {
      await sleep(thirtyMinutes)
      const sessions = await Session.find({
        paymentStatus: 'paid',
        'appointments.status': 'active',
      })
      for (const session of sessions) {
        for (const app of session.appointments) {
          if (app.status !== 'active') continue

          // send notifications
          if (
            Date.now() + thirtyMinutes >= app.start_time.getTime() &&
            app.start_time.getTime() - thirtyMinutes <= Date.now()
          ) {
            // send email to both therapist and patient
            await new Email(session.therapist).sendAppointmentNotification(app)
            await new Email(session.patient).sendAppointmentNotification(app)
            continue
          }

          // mark completed
          if (
            app.start_time.getTime() + twoHours + fifteenMinutes <=
            Date.now()
          ) {
            await Session.updateOne(
              { _id: session._id, 'appointments._id': app._id },
              { 'appointments.$.status': 'complete' }
            )
          }
        }
      }
    } catch (error) {
      console.log('Error occured >>>>', error)
    }
  }
})()
