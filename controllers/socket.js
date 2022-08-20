const Session = require('../models/Session');
const Chat = require("../models/ChatMessage");

module.exports.useSocket = (server) =>{
  const {Server} = require("socket.io");
  const io = new Server(server);
  const connected = [];
  const tracker = [];
  io.on("connection",(socket)=>{
    
    connected.push(socket.id);
    socket.on("initialize",({sessionID})=>{
      Session.findById(sessionID).then(({socketIDs,_id,patient,therapist})=>{
        const expiredID = socketIDs.filter(id =>{
          return !connected.includes(id)
        });
        if(!trackSession(sessionID)){
          tracker.push({sessionID:_id,socketIDs:[socket.id],users:[patient.name,therapist.name]});
        }
        trackSession(sessionID).socketIDs.push(socket.id)
        if(expiredID.length){
          expiredID.map(id =>{
            Session.findByIdAndUpdate(sessionID,{$pull:{socketIDs:id}},{new:true}).then(()=>{
              trackSession(sessionID).socketIDs.splice(trackSession(sessionID).socketIDs.indexOf(id),1);
            })
            
          })
          
        }
           Session.findByIdAndUpdate(sessionID,{$push:{
        socketIDs:socket.id
      }},{new:true}).then(({socketIDs}) =>{
        if(!socketIDs.includes(socket.id)){
          trackSession(sessionID).socketIDs.push(socket.id)}
        
      })
      })
     console.log("initialized")
    })

    const trackSession = (sessionID) =>{
      return tracker.filter((elem)=>{
        return elem.sessionID == sessionID
      })[0]
    }
    const trackSocket = (socketID) =>{
      return tracker.filter(elem =>{
        return elem.socketIDs.includes(socketID)
      })[0]
    }
    const emmitmessage = ({message,sessionID,postedBy}) =>{
        if(trackSocket(socket.id)){
          trackSocket(socket.id).socketIDs.map(id =>{
          socket.broadcast.to(id).emit("message",{
          sessionID,
          message,
          postedBy
        })
      })  
      }  
    }
    socket.on("message",(data)=>{
      const {sessionID, message,postedBy } = data;
      console.log(trackSocket(socket.id),{
        tracker,
        id:socket.id
      })
      emmitmessage(data)
        console.log("message emmited")
        Chat.create({sessionID,message,postedBy}).then(res =>{
          console.log("msg created" + res)
        }).catch(err =>{
          console.log("failed" + err)
        })
    })
    socket.on("disconnect",()=>{
      if(trackSocket(socket.id)){
      connected.splice(connected.indexOf(socket.id),1);
      trackSocket(socket.id).socketIDs.splice(trackSocket(socket.id).socketIDs.indexOf(socket.id),1)
      Session.updateOne({sessionIDs:{$in: socket.id}},{$pull:{socketIDs:socket.id}}) 
      }
    })
  })
}
