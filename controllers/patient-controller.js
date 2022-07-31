const Patient = require("../models/Patient");
const Therapist = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { createTherapySession } = require("./session-controller");
const { StatusCodes } = require("http-status-codes");

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