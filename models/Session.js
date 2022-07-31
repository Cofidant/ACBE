const mongoose = require("mongoose");
const Patient = require("./Patient");
const Therapist = require("./Therapist")

const sessionSchema = mongoose.Schema({
    TherapyType:{
        type:String,
        required:[true,]
    },
    StartDate:{
        type:Date,
        default:Date.now(),
    },
    EndDate:{
        type:Date
    },
    patientID:{
       type: mongoose.Schema.ObjectId,
       ref:"Patient"
    },
    therapistID:{
        type: mongoose.Schema.ObjectId,
        ref:"Therapist"
    },
    
})
module.exports = mongoose.model("session",sessionSchema)