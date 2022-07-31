const { User } = require("../models/User");
const { updatePassword } = require('../controllers/authorization');
const { authenticationMiddleware } = require("../middlewares/authentication");
const { getTherapy, getMe, getSessions, getSession } = require("../controllers/patient-controller");
const patientRouter = require("express").Router();

patientRouter.patch("/update-password",authenticationMiddleware, updatePassword);
patientRouter.post("/get-therapy",authenticationMiddleware,getTherapy);
patientRouter.get("/me",authenticationMiddleware,getMe);
patientRouter.get("/sessions",authenticationMiddleware,getSessions);
patientRouter.get("/session/:id",authenticationMiddleware,getSession);
patientRouter.delete("/session/:id",authenticationMiddleware,);



module.exports = patientRouter;