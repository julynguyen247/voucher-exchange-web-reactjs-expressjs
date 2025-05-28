const { createPaymentUrl, verifyReturnUrl } = require('../services/vnpayService');
const Transaction = require('../models/transaction');
const mongoose = require('mongoose');

const createPayment = async (req, res) => {
    try {
        const { userId, voucherId, voucherName, price } = req.body;

        if (!userId || !voucherId || !voucherName || !price) {
            return res.status(400).json({
                EC: 1,
                message: "Thiếu thông tin cần thiết cho giao dịch"
            });
        }

        const orderInfo = `Thanh toan voucher: ${voucherName.substring(0, 30)}`;

        const paymentData = createPaymentUrl(req, price, orderInfo);

        const urlParams = new URLSearchParams(new URL(paymentData.data).search);
        const txnRef = urlParams.get('vnp_TxnRef');

        const transaction = new Transaction({
            userId: new mongoose.Types.ObjectId(userId),
            voucherId: new mongoose.Types.ObjectId(voucherId),
            voucherName,
            price,
            paymentMethod: 'vnpay',
            status: 'Pending',
            vnpayTxnRef: txnRef
        });

        await transaction.save();

        return res.status(200).json({
            EC: 0,
            message: "Đã tạo URL thanh toán VNPay",
            data: {
                paymentUrl: paymentData.data,
                transactionId: transaction._id
            }
        });
    } catch (error) {
        console.error("Lỗi khi tạo thanh toán VNPay:", error);
        return res.status(500).json({
            EC: 1,
            message: error.message || "Lỗi server khi tạo URL thanh toán"
        });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;

        const isValidSignature = verifyReturnUrl(vnpParams);

        if (!isValidSignature) {
            return res.status(400).json({
                EC: 1,
                message: "Invalid signature"
            });
        }

        const vnp_TxnRef = vnpParams.vnp_TxnRef;
        const vnp_ResponseCode = vnpParams.vnp_ResponseCode;
        const vnp_TransactionNo = vnpParams.vnp_TransactionNo;

        const transaction = await Transaction.findOne({ vnpayTxnRef: vnp_TxnRef });

        if (!transaction) {
            return res.status(404).json({
                EC: 1,
                message: "Không tìm thấy giao dịch"
            });
        }

        if (vnp_ResponseCode === '00') {
            transaction.status = 'complete';
            transaction.vnpayTransactionNo = vnp_TransactionNo;
            await transaction.save();

            return res.status(200).json({
                EC: 0,
                message: "Giao dịch thành công",
                data: {
                    orderId: vnp_TxnRef,
                    transactionId: transaction._id,
                    amount: transaction.price
                }
            });
        } else {
            transaction.status = 'failed';
            await transaction.save();

            return res.status(200).json({
                EC: 1,
                message: "Giao dịch thất bại",
                data: {
                    orderId: vnp_TxnRef,
                    responseCode: vnp_ResponseCode
                }
            });
        }
    } catch (error) {
        console.error("Lỗi xử lý callback VNPay:", error);
        return res.status(500).json({
            EC: 1,
            message: "Lỗi server khi xử lý callback"
        });
    }
};

const checkTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                EC: 1,
                message: "Không tìm thấy giao dịch"
            });
        }

        return res.status(200).json({
            EC: 0,
            data: {
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                amount: transaction.price,
                createdAt: transaction.createdAt
            }
        });
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái giao dịch:", error);
        return res.status(500).json({
            EC: 1,
            message: "Lỗi server khi kiểm tra trạng thái giao dịch"
        });
    }
};

module.exports = {
    createPayment,
    vnpayReturn,
    checkTransactionStatus
};