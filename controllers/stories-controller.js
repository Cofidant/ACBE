const Story = require("../models/Story");

module.exports.getStory = async(id) =>{
    const story = await Story.findById(id);
    return story
}

module.exports.getAllStories = async()=>{
    const stories = await Story.find();
    return stories;
}
module.exports.deleteStory = async(id) =>{
    const updated = await Story.findByIdAndDelete(id);
    return updated;
}
