const QueryHandler = require('../utils/queryHandler');
const catchAsync = require('../utils/catchAsync');
const MyError = require('../utils/myError');

exports.allowEdits = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID';
    const doc = await Model.findById(req.params[id]);
    //console.log({userID: req.user.id, post: doc.title ,authorID: doc.authorID});
    if (doc.authorID != req.user.id && !(req.user.clearance == 'admin')) {
      throw new MyError(
        `You can only ${req.method.toLowerCase()} ${Model.modelName.toLowerCase()} you created`,
        403
      );
    }
    //you cant change author or publish post via this route
    ['authorID', 'published'].forEach((field) => {
      if (req.body[field]) delete req.body[field];
    });

    next();
  });

const confirmExistence = (doc, docName) => {
  if (!doc) {
    throw new MyError(`No ${docName} found with that ID`, 404);
  }
};

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID';
    const doc = await Model.findByIdAndDelete(req.params[id]);
    confirmExistence(doc, Model.modelName);
    res
      .status(204)
      .json({ status: 'succcess', message: 'Document deleted successfully' });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID';
    const doc = await Model.findByIdAndUpdate(req.params[id], req.body, {
      new: true,
      runValidators: true,
    });
    confirmExistence(doc, Model.modelName);
    res.status(201).json({ status: "success", data: doc });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID';
    let query = Model.findById(req.params[id]);
    if (populateOptions) {
      populateOptions.forEach((option) => {
        query = query.populate(...option);
      });
    }
    const doc = await query;
    confirmExistence(doc, Model.modelName);
    res.status(200).json({ status: 'succcess', data: doc });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = req.filter ? req.filter : {};
    let processed = new QueryHandler(
      Model.find(filter),
      req.query,
      'claps -dateCreated'
    ).process();
    const results = await processed;
    res
      .status(200)
      .json({ status: 'success', result: results.length, data: results });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: newDoc });
  });

exports.like = (Model) => catchAsync( async (req, res, next)=>{
  const id = Model.modelName.toLowerCase() + 'ID';
  let method = 'post';
    let liked = await Model.updateOne(
        {_id:req.params[id],claps:{$nin:[req.user.id]}},
        {$addToSet:{claps:req.user.id}}
    );
    if(liked.nModified == 0 && req.method == "DELETE"){
        liked = await Model.updateOne(
            {_id:req.params[id],claps:{$in:req.user.id}},
            {$pull:{claps:req.user.id}}
        );
        method = 'delet';
    }
    res.status(200).json({status:"success", message: `Like ${method}ed successfully`,liked});  
});
