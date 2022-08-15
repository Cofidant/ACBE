const Session = require('../models/Session')

const useSocket = async (server, sessionID, user) => {
  if (!user.id) {
    throw Error({ message: 'authenticate user' })
  }
  const io = require('socket.io')(server)
  const session = await Session.findById(sessionID)

  const participants = {
    patient: session.patient._id,
    therapist: session.therapist._id,
  }
  //check if user is in a session
  if (!Object.values(participants).includes(user.id)) {
    throw new Error({ message: 'user cant participate in this chat' })
  }
  const { patient, therapist } = session
  io.on('connection', (socket) => {
    const recieverIDs = {}
    const emmitMessage = (socket, message) => {
      if (socket.userCategory == 'patient') {
        if (!recieverIDs[therapist]) {
          socket.messages.push(message)
        }
        socket.broadcast.to(recieverIDs.therapist)
      } else if (socket.userCategory == 'therapist') {
        socket.broadcast.to(recieverIDs.patient)
        if (!recieverIDs[patient]) {
          socket.messages.push(message)
        }
      }
    }
    if (user.id == patient._id) {
      Session.findOneAndUpdate(
        session,
        { patient_socket_id: socket.id },
        { new: true }
      ).then((updated) => {
        if (updated.patient_socket_id) {
          recieverIDs.patient = updated.patient_socket_id
        }
        socket.messages = session.messages
        socket.userCategory = 'patient'
        socket.userName = patient.name
      })
    }
    if (session.therapist == user.id) {
      Session.findOneAndUpdate(
        session,
        { therapist_socket_id: socket.id },
        { new: true }
      ).then((updated) => {
        if (updated.therapist_socket_id) {
          recieverIDs.therapist = updated.patient_socket_id
        }
        socket.messages = session.messages
        socket.userID = user.id
        socket.userCategory = 'therapist'
        socket.userName = therapist.name
        socket
          .to(recieverIDs.patient)
          .emit('server_message', {
            message: `${socket.userName} is online`,
            time: Date.now(),
          })
      })
    }

    socket.on('client_message', (message) => {
      if (Object.values(recieverIDs).length < 2) {
        Session.findOneAndUpdate(session, {
          $push: {
            messages: { userName: socket.userName, message, time: Date.now() },
          },
        })
      }
      emmitMessage(socket, {
        userName: socket.userName,
        time: Date.now(),
        message,
      })
    })
    socket.on('disconnect', () => {
      if (socket.userCategory == 'therapist') {
        Session.findOneAndUpdate(session, { therapist_socket_id: null })
      }
      if (socket.userCategory == 'patient') {
        Session.findOneAndUpdate(session, { patient_socket_id: null })
      }
      Session.findOneAndUpdate(session, {
        $push: {
          messages: socket.messages.sort((a, b) => {
            return a.time - b.time
          }),
        },
      })
      socket.emit('server_message', {
        message: `${socket.userName} is offline`,
        time: Date.now(),
      })
    })
  })
}
