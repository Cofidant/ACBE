const Therapist = require("../models/User");

//find a therapist based on preference and standard max-activeSession
module.exports.fetchTherapist = async(preference,maxActiveSession) =>{
    //find therapists with matchin preference (most likely more than one)
    const therapists = await Therapist.find({
        agePreference:preference.agePreference,
        sexPreference:preference.sexPreference,
        locationPreference:preference.location,
        statusPreference:preference.status
    });
    //get therapists below maxActiveSessions
    const availableTherapists = [...therapists].filter(therapist =>{
        return parseInt(therapist.activeSessions) < maxActiveSession;
    })
    //check for no availability
    if(!availableTherapists){
        return;
    }
    //return available therapists if no. of available is one
    if(!availableTherapists.length > 1){
        return availableTherapists[0];
    }
    //if more than one are available
    const findMostAvailable = (availableTherapists) =>{
        let mostAvailable = availableTherapists[0];
        //find most available
        availableTherapists.map(
            therapist =>{
                if(mostAvailable.activeSessions > parseInt(therapist.activeSessions)){
                    mostAvailable = therapist;
                }
            }
        )
        return mostAvailable;
    }
findMostAvailable(availableTherapists);
}