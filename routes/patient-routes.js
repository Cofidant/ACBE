const { User } = require("../models/User");
const { updatePassword } = require('../controllers/authorization');
const { authenticationMiddleware } = require("../middlewares/authentication");
const { getTherapy, getMe } = require("../controllers/patient-controller");
const patientRouter = require("express").Router();
const fetchTherapist = require("../controllers/patient-controller").fetchTherapist;



patientRouter.patch("/update-password",authenticationMiddleware, updatePassword);

patientRouter.post("/get-therapy",authenticationMiddleware,getTherapy);
patientRouter.get("/me",authenticationMiddleware,getMe)


module.exports = patientRouter;