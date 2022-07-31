
const Session = require("../models/Session");
const catchAsync = require("../utils/catchAsync");

const getEndDate = async(duration) =>{
    return new Date(new Date().getTime()+(duration*24*60*60*1000))
};

const updateSessions = async(userID,sessionID) =>{
   const user = await user.findByIdAndUpdate(userID,{
    "$push":{
        sessions:sessionID
    }
   })
   if(!user){
    throw Error("user does not exist")
   }
   return;
}

module.exports.createTherapySession = async(duration, patientID,therapistID)=>{
    if(!duration){
        res.status(400).json("please select duration")
    }
    const session = await Session.create({
        duration,
        EndDate: getEndDate(duration),
        patientID,
        therapistID
    });
   await updateSessions(session.patientID,session._id);
   await updateSessions(session.therapistID,session._id);
   return;
}

module.exports.endTherapySession = async(id)=>{
   const modified = await findByIdAndDelete(id);
   return modified;
}

