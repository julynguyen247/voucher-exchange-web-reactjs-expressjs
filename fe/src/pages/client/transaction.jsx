import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { processTransaction } from "../../utils/api";
import { AuthContext } from "../../components/context/auth.context";
import "../../style/transactionPage.css";
import { QRCode } from "antd";

const TransactionPage = () => {
  const location = useLocation();
  const { voucherId, voucherName, price } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerBankAccount, setSellerBankAccount] = useState("");
  const [sellerBankName, setSellerBankName] = useState("");

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

      const response = await processTransaction(transactionData);

      setMessage(response.data.message);
      if (response.data.sellerPhone) {
        setSellerPhone(response.data.sellerPhone);
      }
      if (response.data.sellerBankAccount) {
        setSellerBankAccount(response.data.sellerBankAccount);
      }
      if (response.data.sellerBankName) {
        setSellerBankName(response.data.sellerBankName);
      }
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

        {paymentMethod === "bank_transfer" && selectedBank && (
          <div className="payment-instruction">
            {selectedBank === "momo" && (
              <div>
                <h3>Quét mã QR để thanh toán bằng Momo</h3>
                <QRCode
                  value={`2|99|${sellerPhone}||0|0|${
                    price * 1000
                  }|Thanh toan voucher ${voucherName}`}
                  size={256}
                />
                <p>
                  <strong>SĐT người nhận:</strong> {sellerPhone}
                </p>
                <p>
                  <strong>Nội dung:</strong> Thanh toan voucher {voucherName}
                </p>
              </div>
            )}

            {selectedBank === "zalo_pay" && (
              <div>
                <h3>Quét mã QR để thanh toán bằng Zalo Pay</h3>
                <QRCode
                  value={`https://pay.zalopay.vn/qr-code?vnp_Amount=${
                    price * 100000
                  }&vnp_OrderInfo=Thanh toan voucher ${voucherName}`}
                  size={256}
                />
                <p>
                  <strong>SĐT người nhận:</strong> {sellerPhone}
                </p>
                <p>
                  <strong>Nội dung:</strong> Thanh toan voucher {voucherName}
                </p>
              </div>
            )}

            {(selectedBank === "vietcombank" ||
              selectedBank === "techcombank") && (
              <div>
                <h3>Thông tin chuyển khoản</h3>
                <p>
                  <strong>Ngân hàng:</strong> {sellerBankName}
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong>{" "}
                  {auth?.user?.name || "Người bán"}
                </p>
                <p>
                  <strong>Số tài khoản:</strong> {sellerBankAccount}
                </p>
                <p>
                  <strong>Nội dung:</strong> Thanh toan voucher {voucherName}
                </p>
              </div>
            )}
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
