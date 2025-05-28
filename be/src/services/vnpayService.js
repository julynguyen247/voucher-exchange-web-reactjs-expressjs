const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config();

// Thêm log để kiểm tra cấu hình
console.log("VNPAY Config:", {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE ? "✓" : "✗",
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET ? "✓" : "✗",
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL
});

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
    // Lấy IP của người dùng
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    // Tạo mã giao dịch duy nhất
    const now = new Date();
    const vnp_TxnRef = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const createDate = formatDate(now);

    // THAY ĐỔI: Đảm bảo amount là số nguyên
    const amountInt = Math.round(amount);

    // Tạo các tham số thanh toán
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Amount: amountInt * 100, // Chuyển đổi sang đơn vị xu
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr,
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderInfo || 'Thanh toan don hang',
        vnp_OrderType: 'other', // THAY ĐỔI: từ 'billpayment' sang 'other' 
        vnp_ReturnUrl: config.vnp_ReturnUrl,
        vnp_TxnRef: vnp_TxnRef
    };

    // THAY ĐỔI: Bỏ vnp_ExpireDate nếu không cần

    // Thêm mã ngân hàng
    if (req.body.bankCode) {
        vnp_Params.vnp_BankCode = req.body.bankCode;
    } else {
        vnp_Params.vnp_BankCode = 'NCB'; // Sử dụng NCB để test
    }

    // Sắp xếp các tham số theo alphabet
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi hash
    let signData = querystring.stringify(vnp_Params, { encode: false });

    // Tạo chữ ký
    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Thêm chữ ký vào params
    vnp_Params.vnp_SecureHash = vnp_SecureHash;

    // Tạo URL thanh toán
    const paymentUrl = config.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    // Log để debug
    console.log("VNPAY Payment URL created:", {
        amountInt,
        orderInfo,
        txnRef: vnp_TxnRef,
        urlLength: paymentUrl.length
    });

    return {
        code: '00',
        message: 'success',
        data: paymentUrl
    };
};

// Không thay đổi các hàm khác
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

    const signData = querystring.stringify(sortedParams, { encode: false });

    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === calculatedHash;
};

module.exports = {
    createPaymentUrl,
    verifyReturnUrl,
    config
};