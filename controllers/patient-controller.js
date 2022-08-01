const Patient = require("../models/Patient");
const Therapist = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { createTherapySession, endTherapySession } = require("./session-controller");
const { StatusCodes } = require("http-status-codes");
const { findById, findByIdAndDelete } = require("../models/User");
const Session = require("../models/Session");

//find a therapist based on preference and standard max-activeSession
const fetchTherapist = async(profile,maxActiveSession) =>{
    //grab all therapists   
    let therapists = await Therapist.find();
    therapists = [...therapists].filter(therapist =>{
    //filter only available therapists
    return therapist.sessions.length < maxActiveSession;
    })
    //filter therapists by gender if gender is specified
    if(profile.gender){
    therapists = availableTherapists.filter(therapist =>{
        //update therapists
            return profile.gender == therapist.sexPreference;
        });
        if(!filtered_by_gender.length){
            //return
            return {message:`sorry,no ${profile.gender} therapists available`}
        }
    }
    //filter by age
    if(profile.age){
        therapists = therapists.filter(therapist =>{
            return profile.age == therapist.agePreference
        })
        if(!therapists.length){
            return {message:`sorry,no ${profile.age} therapists available`}
        }
    }//filter by religion
    if(preference.religion){
        therapists = therapists.filter(therapist =>{
            return profile.religion == therapist.religionPreference
        })
        if(!therapists.length){
            return {message:`sorry,no ${profile.religion} therapists available`}
        }
    }
    if(profile.location){
        therapists = therapists.filter(therapist =>{
            return profile.location == therapist.locationPreference
        })
        if(!therapists.length){
            return {message:`sorry,no ${preferencelocation} therapists available`}
        }
    }
    if(profile.status){
        therapists = therapists.filter(therapist =>{
            return profile.status == therapist.statusPreference
        })
        if(!therapists.length){
            return {message:`sorry,no ${profile.status} therapists available`}
        }
    }
    return therapists;
}

module.exports.getMe = catchAsync(async(req,res,next)=>{
    const id = req.user.id;
    const patient = await Patient.findById(id);
    if(!patient){
        res.status(StatusCodes.NOT_FOUND).json("user does not exist")
    }
})

module.exports.getTherapy = catchAsync(async(req,res,next)=>{
    try {
    //get available therapist
    const therapist = fetchTherapist(req.body.profile,process.env.MAXSESSION)
    const patientID = req.user.id;
    //create session from id embeded in token and most available therapist id
    const newSession = await createTherapySession(req.body.duration,patientID,therapist._id);
    res.status(StatusCodes.CREATED).json({message:"new therapy session created",data:newSession})
        
    } catch (error) {
        res.status(500).json("could not create session");
    }
    }
)

module.exports.getSessions = async(req,res) =>{
    const sessions = [];
    const { id } = req.user;
    const user = await Patient.findById(id);
    if(!user){
        res.status(StatusCodes.NOT_FOUND).json("user does not exist")
    }
    const sessionIDs = user.sessions;
    await sessionIDs.map(session =>{
        Patient.findById(session).then(
            session =>{sessions.push(session)}
        )
    })
    res.status(StatusCodes.OK.json(sessions))
}

module.exports.getSession = async(req,res) =>{
    const session = await Session.findById(req.params.id);
    res.status(StatusCodes.OK).json(session);
}

module.exports.endSession = async(req,res) =>{
    const modified = await endTherapySession(req.params.id)
    res.status(StatusCodes.OK).json(modified);
}
//req.body includes selected therapists id, contract period (duration)
module.exports.selectTherapy = async(req,res)=>{
    const therapist = await Therapist.find(req.body.id);
    if(!therapist){res.status(400).json({status:"failed",message:"please select a therapist"})}
    const patient = await Patient.find(req.user.id);
    if(!patient){res.status(StatusCodes.NOT_FOUND).json({status:"failed",message:"user not found"})};
    const newSession = await createTherapySession(req.body.duration,patient._id,therapist._id);
    if(!newSession){res.status(500).json({status:"failed",message:"could not create therapy session"})}
}