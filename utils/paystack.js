const axios = require('axios');
const MyError = require('./myError');

const mySecretKey = `Bearer ${process.env.PAYSTACK_KEY}`
exports.initializePayment = async (data, mycallback) => {
    const options = {
        method: 'POST',
        url : 'https://api.paystack.co/transaction/initialize',
        headers : {
            authorization: mySecretKey,
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        },
       data
    }
    try {
        const {res,data} = await axios(options);
        // console.log(data);
        mycallback(data);
    } catch (error) {
        console.log(error);
        throw new MyError(error.message,500);
    }
}

exports.verifyPayment = async (ref, callback) => {
    const options = {
        method: 'GET',
        url : `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
        headers : {
            authorization: mySecretKey,
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        }
    }
    try {
        const {res,data} = await axios(options);
        // console.log(data);
        callback(data);
    } catch (error) {
        console.log(error);
        throw new MyError(error.message,500);
    }
}