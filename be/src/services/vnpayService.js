const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config();

const formatDate = (date) => {
    const pad = (number) => (number < 10 ? '0' + number : number);

    return date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
};

const config = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_ApiUrl: process.env.VNPAY_API_URL
};

const createPaymentUrl = (req, amount, orderInfo) => {
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '127.0.0.1';

    const now = new Date();
    const vnp_TxnRef = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const createDate = formatDate(now);

    const amountInt = Math.round(parseFloat(amount) * 100);

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Amount: amountInt,
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr.replace(/::ffff:/g, ''),
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderInfo || 'Thanh toan don hang',
        vnp_OrderType: 'other',
        vnp_ReturnUrl: config.vnp_ReturnUrl,
        vnp_TxnRef: vnp_TxnRef
    };

    if (req.body.bankCode) {
        vnp_Params.vnp_BankCode = req.body.bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    let signData = '';
    const secureHash = config.vnp_HashSecret;
    const signKeys = Object.keys(vnp_Params);

    for (let i = 0; i < signKeys.length; i++) {
        const key = signKeys[i];
        if (i === 0) {
            signData = key + '=' + vnp_Params[key];
        } else {
            signData += '&' + key + '=' + vnp_Params[key];
        }
    }

    // Tạo chữ ký
    const hmac = crypto.createHmac('sha512', secureHash);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Thêm chữ ký vào params
    vnp_Params.vnp_SecureHash = vnp_SecureHash;

    // Tạo payment URL
    const paymentUrl = config.vnp_Url + '?' +
        Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
            .join('&');

    console.log("VNPAY Payment URL created:", {
        amountInt,
        orderInfo,
        txnRef: vnp_TxnRef,
        paymentUrl
    });
    console.log("signData:", signData);
    console.log("vnp_SecureHash:", vnp_SecureHash);
    console.log("paymentUrl:", paymentUrl);

    return {
        code: '00',
        message: 'success',
        data: paymentUrl
    };
};



const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        if (obj.hasOwnProperty(key)) {
            sorted[key] = obj[key];
        }
    }

    return sorted;
};

const verifyReturnUrl = (vnpParams) => {
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = sortObject(vnpParams);

    let signData = '';
    const signKeys = Object.keys(sortedParams);

    for (let i = 0; i < signKeys.length; i++) {
        const key = signKeys[i];
        if (i === 0) {
            signData = key + '=' + sortedParams[key];
        } else {
            signData += '&' + key + '=' + sortedParams[key];
        }
    }

    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === calculatedHash;
};

module.exports = {
    createPaymentUrl,
    verifyReturnUrl,
    config
};