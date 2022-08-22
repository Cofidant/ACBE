const { Router } = require("express");
const { getBlackLists, addToBlackList, getBlackList, removeFromBlackList } = require("../controllers/blacklist-controller");
const { restrictRouteTo, authenticationMiddleware } = require("../middlewares/authentication");
const Therapist = require("../models/Therapist");
const blacklistRouter = Router();

blacklistRouter.use(authenticationMiddleware)
blacklistRouter.post("/",restrictRouteTo("patient"),addToBlackList)
blacklistRouter.use(restrictRouteTo("admin"))
blacklistRouter.route("/")
.get(getBlackLists)

blacklistRouter.route("/:id")
.get(restrictRouteTo("admin"),getBlackList)
.delete(restrictRouteTo("admin"),removeFromBlackList)

module.exports = blacklistRouter;