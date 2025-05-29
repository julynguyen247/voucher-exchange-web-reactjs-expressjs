const Voucher = require("../models/voucher");

const simulateMomoWebhook = async (req, res) => {
    try {
        const { orderId, resultCode } = req.body;

        if (resultCode === 0) {
            const voucher = await Voucher.findById(orderId);
            voucher.quantity -= 1;
            if (voucher.quantity <= 0) {
                await Voucher.findByIdAndDelete(orderId);
            }
            else
                await voucher.save();
        }
    }
    catch (error) {
        console.error("Lỗi xử lý webhook Momo:", error);
        return res.status(500).json({ message: "Lỗi server." });
    }
};

module.exports = { simulateMomoWebhook };