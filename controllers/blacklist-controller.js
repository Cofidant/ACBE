const { StatusCodes } = require("http-status-codes")
const { Blacklist } = require("../models/blacklists")
const Patient = require("../models/Patient")
const Therapist = require("../models/Therapist")
const User = require("../models/User")

module.exports.getBlackLists = async(req,res) =>{
    
   return res.status(StatusCodes.OK).json(await Blacklist.find()) 
}

module.exports.getBlackList = async(req,res) =>{
    const {id} = req.params;
    if(!id) return res.status(StatusCodes.BAD_REQUEST).json({message:"please provide an id parameter"});
    return res.status(StatusCodes.OK).json(await Blacklist.find({therapist: await Therapist.findById(id)}))
}

module.exports.removeFromBlackList = async(req,res) =>{
    const {id} = req.params;
    if(!id) return res.status(StatusCodes.BAD_REQUEST).json({message:"please provide an id parameter"});
    return res.status(StatusCodes.OK).json(await Blacklist.findOneAndRemove({therapist:await Therapist.findById(id)}));
}
module.exports.addToBlackList = async(req,res) =>{
    const {id} = req.params;
    if(!req.user) return res.status(StatusCodes.UNAUTHORIZED).json({message:"please login to make reports"})

    const complainant = await Patient.findById(req.user._id);
    if(!complainant) return res.status(StatusCodes).json({message:"complainant not found"});
    const therapist = await Therapist.findById(id);
     if(!therapist) return res.status(StatusCodes.NOT_FOUND).json({message:"user not found"});
    const {comment } = req.body;
    if(!id) return res.status(StatusCodes.BAD_REQUEST).json({message:"please provide an id parameter"});
    const blacklisted = await Blacklist.findOne({therapist: therapist._id});
    if(!blacklisted) return res.status(StatusCodes.OK).json(await Blacklist.create({
    therapist,
    reports:[{complainant,comment}]
    }))
    return res.status(StatusCodes.OK).json(await Blacklist.findOneAndUpdate({therapist:therapist._id},{
        $push:{
            reports:{comment}
        }
    },{new:true})) 
}
