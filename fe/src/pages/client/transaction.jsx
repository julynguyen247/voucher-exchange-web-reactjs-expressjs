import React, { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { processTransaction } from "../../utils/api";
import { AuthContext } from "../../components/context/auth.context";
import "../../style/transactionPage.css";

const TransactionPage = () => {
  const location = useLocation();
  const { voucherId, voucherName, price } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setSelectedBank("");
  };

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const handleTransaction = async () => {
    try {
      const userId = auth?.user?.id;

      if (!userId) {
        setMessage("Người dùng chưa được xác thực.");
        return;
      }

      const transactionData = {
        userId,
        voucherId,
        voucherName,
        price,
        paymentMethod,
        ...(paymentMethod === "bank_transfer" &&
          selectedBank && { bank: selectedBank }),
      };
      console.log("userId:", userId);
      console.log("voucherId:", voucherId);
      console.log("voucherName:", voucherName);
      console.log("price:", price);
      console.log("paymentMethod:", paymentMethod);
      if (paymentMethod === "bank_transfer") {
        console.log("selectedBank:", selectedBank);
      }

      console.log("Sending transaction data:", transactionData);

      const response = await processTransaction(transactionData);
      console.log("API Response:", response);
      setMessage(response.data.message);
    } catch (error) {
      console.error(
        "Giao dịch thất bại:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || error.message || "Giao dịch thất bại";
      setMessage(errorMessage);
    }
  };

  return (
    <div className="transaction-container">
      <h1 className="transaction-title">Xác Nhận Thanh Toán</h1>
      <div className="transaction-details">
        <p>
          <strong>Voucher:</strong> {voucherName}
        </p>
        <p>
          <strong>Giá:</strong>{" "}
          {price
            ? price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "N/A"}
        </p>
      </div>

      <div className="payment-options">
        <h2>Chọn Phương Thức Thanh Toán</h2>
        <div className="payment-method">
          <label className="radio-label">
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={handlePaymentMethodChange}
            />
            <span>Tiền Mặt</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="bank_transfer"
              checked={paymentMethod === "bank_transfer"}
              onChange={handlePaymentMethodChange}
            />
            <span>Chuyển Khoản Ngân Hàng</span>
          </label>
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="bank-selection">
            <p>Chọn Ngân Hàng:</p>
            <select value={selectedBank} onChange={handleBankChange}>
              <option value="">-- Chọn Ngân Hàng --</option>
              <option value="momo">Momo</option>
              <option value="zalo_pay">Zalo Pay</option>
              <option value="vietcombank">Vietcombank</option>
              <option value="techcombank">Techcombank</option>
            </select>
          </div>
        )}
      </div>

      <button onClick={handleTransaction} className="confirm-button">
        Xác Nhận Thanh Toán
      </button>

      {message && (
        <div
          className={`message ${
            message.includes("Transaction successful") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
