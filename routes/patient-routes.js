const { updatePassword } = require('../controllers/authorization');
const { authenticationMiddleware } = require("../middlewares/authentication");
const { getTherapy, getMe, getSessions, getSession, endSession, selectTherapy, createStory, getStory, deleteStory, getMyStories } = require("../controllers/patient-controller");

const patientRouter = require("express").Router();

patientRouter.patch("/update-password",authenticationMiddleware, updatePassword);
patientRouter.post("/get-therapy",authenticationMiddleware,getTherapy);
patientRouter.post("/therapy/select",authenticationMiddleware,selectTherapy);
patientRouter.get("/me",authenticationMiddleware,getMe);
patientRouter.get("/sessions",authenticationMiddleware,getSessions);
patientRouter.get("/session/:id",authenticationMiddleware,getSession);
patientRouter.delete("/session/:id",authenticationMiddleware,endSession);
patientRouter.post("/new-story",authenticationMiddleware,createStory);
patientRouter.get("/story/:id",authenticationMiddleware,getStory);
patientRouter.delete("/story/:id",authenticationMiddleware,deleteStory);
patientRouter.get("/my-stories",authenticationMiddleware,getMyStories);

module.exports = patientRouter;