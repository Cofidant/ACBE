const mongoose = require("mongoose");
const User = require("./User");

const storySchema = mongoose.Schema({
    preview:{
        type:String,
        required:[true,"please provide a previw of your story"]
    },
    body:{
        type:String,
        required:[true,"please type in your story body"]
    },
    comments:{
        type:Array,
        default:[]
    }
},{
    timestamps:true
}
)

const Story = mongoose.model("story",storySchema);