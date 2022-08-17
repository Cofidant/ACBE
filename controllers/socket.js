const Session = require('../models/Session');
const Chat = require("../models/ChatMessage");


const useSocket = (server) =>{
  const io = require("socket.io");
  const connected = []
  io.on("connection",(socket)=>{
    connected.push(socket.id);
    socket.on("initialize",(data)=>{
      Session.findById(data.sessionID).then((session)=>{
        const expiredSocketID = session.socketIDs.filter(id =>{
         return !connected.includes(id)
        })[0]
        session.socketIDs = session.sessionIDs.splice(session.socketIDs.indexof(expiredSocketID),1).push(socket.id);
        session.save().then(session =>{
          socket.session = session;
          socket.messages = [];
        })
      })
    })
    const emmitmessage = (message) =>{
      socket.session.socketIDs.map(socketID =>{
        socket.to(socketID).emit("message",{message})
        socket.messages.push(message)
      })
    }
    socket.on("message",(data)=>{
      const recieverID = socket.session.socketIDs.filter(id =>{
        return id !== socket.id;
      })[0]
      //if reciever is offline
      if(!recieverID){
        //save messages to collection
      Chat.create({
        sessionID:socket.session._id,
        message: data.message,
        postedBy:data.postedBy,
      })
             }
      //emmit message
        emmitmessage({message: data.message,postedBy:data.postedBy,date: new Date(),recieverActive: () => {!recieverID? false:true;}});
    })
    socket.on("disconnect",()=>{
      Chat.find({sessionID:socket.session._id})
      .sort({createdAt:1})
      .then((messages)=>{
        socket.messages.filter(({date }) =>{
        return date > messages[messages.length].date
      }).map(message =>{
        Chat.create()
      })
      })
    })
  })
}
//connect to db
//on message {MESSAGE A.K.A DATA INCLUDES CLIENT SMS,SESSIONID,}
//check if socket.sessionID exists
//if not, set socket.sessionID 
