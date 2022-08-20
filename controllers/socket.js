const Session = require('../models/Session');
const Chat = require("../models/ChatMessage");


module.exports.useSocket = (server) =>{
  const {Server} = require("socket.io");
  const io = new Server(server)
  const connected = []
  io.on("connection",(socket)=>{
    connected.push(socket.id);
    socket.on("initialize",(data)=>{
      Session.findById(data.sessionID).then((session)=>{
        const expiredSocketID = session.socketIDs.filter(id =>{
         return !connected.includes(id)
        })[0];
        session.sessionIDs.splice(session.socketIDs.indexof(expiredSocketID),1).push(socket.id);
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
