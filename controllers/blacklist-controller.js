const { StatusCodes } = require("http-status-codes")
const { Blacklist } = require("../models/blacklists")
const Therapist = require("../models/Therapist")

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
    
    const {id} = req.params || req.body
     if(!therapist) return res.status(StatusCodes.NOT_FOUND).json({message:"user not found"});
    const therapist = await Therapist.findById(id);
    const {comment } = req.body
    if(!id) return res.status(StatusCodes.BAD_REQUEST).json({message:"please provide an id parameter"});
    const blacklisted = await Blacklist.find({therapist: await Therapist.findById(id)});
    if(!blacklisted) return res.status(StatusCodes.OK).json(await Blacklist.create({
    therapist,
    comments:[comment]
    }))
    return res.status(StatusCodes.OK).json(await Blacklist.findByIdAndUpdate(blacklisted.therapist._id,{
        $push:{
            comments:comment
        }
    },{new:true})) 
}