const QueryHandler = require("../utils/queryHandler");
const catchAsync = require("../utils/catchAsync");
const MyError = require("../utils/myError");
const Comment = require("../models/commentModel");
const factory = require("./handlerFactory");

exports.assignIDs = catchAsync(async (req,res,next)=>{
    if(!req.body.postID)
        req.body.postID = req.params.postID;
    if(!req.body.authorID)
        req.body.authorID = req.user.id;
    next();
});

exports.setDefaultFilter = (req,res,next) =>{
    const filter = req.params.postID?{postID:req.params.postID,parentID:null}:{parentID:null};
    req.filter = filter;
    next();
}

exports.likeComment = factory.like(Comment);
exports.allowEdits = factory.allowEdits(Comment);
exports.getComments = factory.getAll(Comment);
exports.commentPost = factory.createOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);
exports.updateComment = factory.updateOne(Comment);
exports.getOne = factory.getOne(Comment,{path:"authorID"});
