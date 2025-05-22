import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../../style/transactionPage.css";
import { QRCode } from "antd";
import {
  processTransaction,
  getSellerPaymentDetails,
} from "../../../utils/api";
import { AuthContext } from "../../../components/context/auth.context";

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
    setSellerPhone("");
    setSellerBankAccount("");
    setSellerBankName("");
    setMessage("");
  };

  const handleBankChange = async (event) => {
    const newSelectedBank = event.target.value;
    setSelectedBank(newSelectedBank);
    setMessage("");

    if (paymentMethod === "bank_transfer" && newSelectedBank) {
      setSellerPhone("");
      setSellerBankAccount("");
      setSellerBankName("");
      try {
        const response = await getSellerPaymentDetails(
          voucherId,
          newSelectedBank
        );

        if (response.data && response.data.EC === 0) {
          const details = response.data.data;
          setSellerPhone(details.sellerPhone || "");
          setSellerBankAccount(details.sellerBankAccount || "");
          setSellerBankName(details.sellerBankName || "");

          if (
            (newSelectedBank === "momo" || newSelectedBank === "zalo_pay") &&
            !details.sellerPhone
          ) {
            setMessage(`Không tìm thấy SĐT người bán cho ${newSelectedBank}.`);
          } else if (
            (newSelectedBank === "vietcombank" ||
              newSelectedBank === "techcombank") &&
            (!details.sellerBankAccount || !details.sellerBankName)
          ) {
            setMessage(
              `Không tìm thấy thông tin tài khoản cho ${newSelectedBank}.`
            );
          }
        } else {
          const errorMessage =
            response.data?.message ||
            "Không thể lấy thông tin người bán cho ngân hàng này.";
          setMessage(errorMessage);
        }
      } catch (error) {
        console.error(
          "Lỗi khi lấy thông tin người bán:",
          error.response?.data || error.message
        );
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Lỗi kết nối hoặc máy chủ khi lấy thông tin người bán. Vui lòng thử lại.";
        setMessage(errorMessage);
      }
    } else {
      // Nếu không chọn bank_transfer hoặc không chọn ngân hàng cụ thể, xóa thông tin
      setSellerPhone("");
      setSellerBankAccount("");
      setSellerBankName("");
    }
  };

  const handleTransaction = async () => {
    setMessage(""); // Xóa message cũ trước khi thực hiện giao dịch mới
    if (!auth?.user?.id) {
      setMessage("Người dùng chưa được xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    if (paymentMethod === "bank_transfer") {
      if (
        (selectedBank === "momo" || selectedBank === "zalo_pay") &&
        !sellerPhone
      ) {
        setMessage(
          `Thông tin SĐT cho ${selectedBank} chưa được tải. Vui lòng chọn lại ngân hàng hoặc thử lại.`
        );
        return;
      }
      if (
        (selectedBank === "vietcombank" || selectedBank === "techcombank") &&
        (!sellerBankAccount || !sellerBankName)
      ) {
        setMessage(
          `Thông tin tài khoản cho ${selectedBank} chưa được tải. Vui lòng chọn lại ngân hàng hoặc thử lại.`
        );
        return;
      }
    }
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
      const details = response.data.data;
      setSellerPhone(details.sellerPhone || "");
      setSellerBankAccount(details.sellerBankAccount || "");
      setSellerBankName(details.sellerBankName || "");
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

        {/* Hiển thị thông tin thanh toán tương ứng với ngân hàng được chọn */}
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
