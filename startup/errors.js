const log = require("../logger")

module.exports = () =>{
process.on("uncaughtException",(ex)=>{log("error",`an error occured :${ex}`)})
process.on("unhandledRejection",(ex)=>{
   // console.log(ex)
    log("error",ex)
})
process.on("deprecation",(ex)=>{
    console.log(ex)
    log("warning",ex)})
}