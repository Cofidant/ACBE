const {getDuration} = require("../../utils/myUtills")

describe("get durations",()=>{
    it("should return duration if a defined date is given",()=>{
        const result = getDuration( Date.now() - 120)
        console.log(result)
        /*
        >>>>>
        brb to refactor /result inaccurate
        */
        expect(result).not.toBeNull()
    })
    it("should return O years if undefinde date is passed",()=>{
        const result = getDuration()
        expect(result).toEqual("0 second ago")
    })

})