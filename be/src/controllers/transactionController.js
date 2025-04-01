const {
  createTransactionService,
  getTransactionsService,
} = require("../services/transactionService");

const processTransaction = async (req, res) => {
  try {
    console.log("Received transaction data:", req.body);

    const { userId, voucherId, voucherName, price, paymentMethod } = req.body;

    if (!userId || !voucherId || !voucherName || !price || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const data = await createTransactionService(
      userId,
      voucherId,
      voucherName,
      price,
      paymentMethod
    );

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: data.transaction,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing userId",
      });
    }

    const result = await getTransactionsService(userId);
    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result.transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
module.exports = {
  processTransaction,
  getTransactions,
};
