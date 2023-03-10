const mongoose = require("mongoose");

exports.Blacklist = mongoose.model("blacklist",new mongoose.Schema({
    therapist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"therapist",
        required:true
    },
    reports:{
        type:[Object]
    }

},{
    timestamps:true
}))