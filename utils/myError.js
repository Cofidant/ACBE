class MyError extends Error{
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")?"fail":"error";
        this.isUserError = true;

        Error.captureStackTrace(this,this.constructor);

    }
}

module.exports = MyError;