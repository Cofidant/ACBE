const { User } = require("../models/User");

const router = require("express").Router();
const fetchTherapist = require("../controllers/patient-controller").fetchTherapist;

router.post("/get-therapist", async (req,res)=>{

    const mostAvailable = await fetchTherapist(req.body.preference,5);
    if(!mostAvailable){
        //no available therapist
        res.status(200).json("no match available at the moment");
    }
    res.status(200).json(mostAvailable)
})

router.get("/accept-therapy/:id",async(req,res)=>{
    const {id} = req.user.id;

})

module.exports = router;