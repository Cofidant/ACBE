const Session = require('../models/Session')
const Email = require('../utils/email')
const logger = require('../logger')
const {
  sleep,
  fifteenMinutes,
  thirtyMinutes,
  twenty4hours,
} = require('../utils/date_funcs')

// Delete Sessions That are reserved but not paid later than 24 hours
;(async function () {
  while (true) {
    try {
      await sleep(fifteenMinutes / 15)
      const sessions = await Session.find({
        paymentStatus: 'pending',
      })
      for (const session of sessions) {
        // only those sessions later than 24 hours from date reserved
        if (session.createdAt.getTime() + twenty4hours <= Date.now()) {
          Session.findByIdAndDelete(session._id).catch((err) =>
            logger('error', err)
          )
          // Send Removal Email
          new Email(session.patient).sendReservationExpired().then(() => {})
        }
      }
    } catch (error) {
      logger('error', error)
    }
  }
})()

// Send Notifications For Appointments that are due in 30 minutes
// mark appointments that are complete (end_time <= current time) as complete
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
            new Email(session.therapist)
              .sendAppointmentNotification(app)
              .then(() => {})
            new Email(session.patient)
              .sendAppointmentNotification(app)
              .then(() => {})
            continue
          }

          // mark completed
          if (app.end_time <= Date.now()) {
            await Session.updateOne(
              { _id: session._id, 'appointments._id': app._id },
              { 'appointments.$.status': 'complete' }
            )
          }
        }
      }
    } catch (error) {
      logger('error', error)
      sleep(fifteenMinutes / 15)
    }
  }
})()
