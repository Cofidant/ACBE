const { Router } = require("express");
const { getBlackLists, addToBlackList, getBlackList, removeFromBlackList } = require("../controllers/blacklist-controller");
const { restrictRouteTo, authenticationMiddleware } = require("../middlewares/authentication");
const blacklistRouter = Router();

blacklistRouter.use(authenticationMiddleware)
blacklistRouter.post("/:id",restrictRouteTo("patient"),addToBlackList)
blacklistRouter.use(restrictRouteTo("admin"))
blacklistRouter.route("/")
.get(getBlackLists)

blacklistRouter.route("/:id")
.get(getBlackList)
.delete(removeFromBlackList)

module.exports = blacklistRouter;