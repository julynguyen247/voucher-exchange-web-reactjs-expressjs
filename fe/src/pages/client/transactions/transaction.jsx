import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../style/transactionPage.css";
import { QRCode } from "antd";
import {
  processTransaction,
  getSellerPaymentDetails,
  createVnpayPayment,
} from "../../../utils/api";
import { AuthContext } from "../../../components/context/auth.context";

const TransactionPage = () => {
  const location = useLocation();
  const { voucherId, voucherName, price } = location.state || {};

  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerBankAccount, setSellerBankAccount] = useState("");
  const [sellerBankName, setSellerBankName] = useState("");
  const [sellerAccountHolderName, setSellerAccountHolderName] = useState("");

  const [isLoadingSellerInfo, setIsLoadingSellerInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!voucherId || !voucherName || typeof price !== "number") {
      setMessage("Thông tin voucher không hợp lệ. Vui lòng thử lại.");
    }
  }, [voucherId, voucherName, price]);

  const handlePaymentOptionChange = async (event) => {
    const newPaymentOption = event.target.value;
    setSelectedPaymentOption(newPaymentOption);
    setMessage("");
    setSellerPhone("");
    setSellerBankAccount("");
    setSellerBankName("");
    setSellerAccountHolderName("");

    if (newPaymentOption === "vnpay") {
      return;
    }

    if (newPaymentOption) {
      setIsLoadingSellerInfo(true);
      try {
        const response = await getSellerPaymentDetails(
          voucherId,
          newPaymentOption
        );

        if (response.data && response.data.EC === 0) {
          const details = response.data.data;
          if (newPaymentOption === "momo") {
            setSellerPhone(details.sellerPhone || "");
            if (!details.sellerPhone) {
              setMessage(
                `Không tìm thấy SĐT người bán cho ${newPaymentOption}.`
              );
            }
          } else if (newPaymentOption === "vietqr_bank_transfer") {
            setSellerBankName(details.sellerBankName || "");
            setSellerBankAccount(details.sellerBankAccount || "");
            setSellerAccountHolderName(details.sellerAccountHolderName || "");
            if (
              !details.sellerBankName ||
              !details.sellerBankAccount ||
              !details.sellerAccountHolderName
            ) {
              setMessage(
                "Người bán chưa cập nhật đủ thông tin tài khoản ngân hàng (ngân hàng, STK, tên chủ TK)."
              );
            }
          }
        } else {
          setMessage(
            response.data?.message ||
            `Không thể lấy thông tin cho ${newPaymentOption}.`
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin thanh toán:", error);
        setMessage(
          error.response?.data?.message ||
          "Lỗi kết nối khi lấy thông tin thanh toán."
        );
      } finally {
        setIsLoadingSellerInfo(false);
      }
    }
  };

  const handleVnpayPayment = async () => {
    setMessage("");
    setIsProcessing(true);

    if (!auth?.user?.id) {
      setMessage("Người dùng chưa được xác thực.");
      setIsProcessing(false);
      return;
    }

    try {
      const paymentData = {
        userId: auth.user.id,
        voucherId,
        voucherName,
        price
      };

      const response = await createVnpayPayment(paymentData);
      if (response.data && response.data.EC === 0) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        setMessage(response.data?.message || "Không thể tạo thanh toán VNPAY.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán VNPAY:", error);
      setMessage(error.response?.data?.message || "Lỗi khi xử lý yêu cầu thanh toán.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransaction = async () => {
    setMessage("");
    setIsProcessing(true);

    if (!auth?.user?.id) {
      setMessage("Người dùng chưa được xác thực.");
      setIsProcessing(false);
      return;
    }

    if (!selectedPaymentOption) {
      setMessage("Vui lòng chọn một phương thức thanh toán.");
      setIsProcessing(false);
      return;
    }

    if (isLoadingSellerInfo) {
      setMessage("Đang tải thông tin, vui lòng đợi.");
      setIsProcessing(false);
      return;
    }

    if (selectedPaymentOption === "vnpay") {
      handleVnpayPayment();
      return;
    }

    if (
      (selectedPaymentOption === "momo") &&
      !sellerPhone
    ) {
      setMessage(`Thông tin SĐT cho ${selectedPaymentOption} chưa sẵn sàng.`);
      setIsProcessing(false);
      return;
    }

    if (
      selectedPaymentOption === "vietqr_bank_transfer" &&
      (!sellerBankAccount || !sellerBankName || !sellerAccountHolderName)
    ) {
      setMessage("Thông tin tài khoản ngân hàng của người bán chưa sẵn sàng.");
      setIsProcessing(false);
      return;
    }

    try {
      const transactionData = {
        userId: auth.user.id,
        voucherId,
        voucherName,
        price,
        paymentMethod: selectedPaymentOption,
        status: "pending",
        deleted: true
      };

      const response = await processTransaction(transactionData);
      if (response.data && response.data.EC === 0) {
        setMessage(response.data.message || "Giao dịch thành công!");
        setTimeout(() => {
          navigate("/transaction-history");
        }, 1500);
      } else {
        setMessage(response.data?.message || "Giao dịch thất bại.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi khi xử lý giao dịch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentInstructions = () => {
    if (isLoadingSellerInfo) {
      return <p>Đang tải thông tin thanh toán...</p>;
    }

    if (selectedPaymentOption === "vnpay") {
      return (
        <div>
          <h3>Thanh toán qua VNPAY</h3>
          <div className="vnpay-info">
            <img
              src="/vnpay-logo.png"
              alt="VNPAY"
              style={{ maxWidth: 200, margin: "10px 0" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo.svg";
              }}
            />
            <p>Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất thanh toán.</p>
            <p>VNPAY hỗ trợ thanh toán bằng QR Code, thẻ ATM nội địa, thẻ quốc tế và ví điện tử.</p>
          </div>
        </div>
      );
    }

    if (selectedPaymentOption === "momo" && sellerPhone) {
      return (
        <div>
          <h3>Quét mã QR để thanh toán bằng Momo</h3>
          <QRCode style={{ margin: "16px auto" }}
            value={`2|99|${sellerPhone}|||${price}|${encodeURIComponent(
              `TT Voucher ${voucherName.substring(0, 10)}`
            )}|0|0&orderID=${voucherId}`}
            size={256}
          />
          <p>
            <strong>SĐT người nhận:</strong> {sellerPhone}
          </p>
          <p>
            <strong>Số tiền:</strong> {price.toLocaleString("vi-VN")} VND
          </p>
          <p>
            <strong>Nội dung:</strong> TT Voucher{" "}
            {voucherName.substring(0, 10)}
          </p>
        </div>
      );
    }

    if (
      selectedPaymentOption === "vietqr_bank_transfer" &&
      sellerBankAccount &&
      sellerBankName &&
      sellerAccountHolderName
    ) {
      return (
        <div>
          <h3>Chuyển khoản thủ công</h3>
          <p>
            <strong>Ngân hàng người bán:</strong>{" "}
            {sellerBankName.toUpperCase()}
          </p>
          <p>
            <strong>Chủ tài khoản:</strong> {sellerAccountHolderName}
          </p>
          <p>
            <strong>Số tài khoản:</strong> {sellerBankAccount}
          </p>
          <p>
            <strong>Số tiền:</strong> {price.toLocaleString("vi-VN")} VND
          </p>
          <p>
            <strong>Nội dung:</strong>{" "}
            {`TT VCR ${voucherName.substring(0, 10)}`}
          </p>
        </div>
      );
    }

    if (!message) {
      if ((selectedPaymentOption === "momo") && !sellerPhone) {
        return (
          <p>
            Không thể tải thông tin SĐT cho {selectedPaymentOption}.
            Vui lòng thử lại.
          </p>
        );
      }

      if (
        selectedPaymentOption === "vietqr_bank_transfer" &&
        (!sellerBankAccount || !sellerBankName || !sellerAccountHolderName)
      ) {
        return (
          <p>
            Không thể tải thông tin tài khoản ngân hàng. Vui lòng thử
            lại.
          </p>
        );
      }
    }

    return null;
  };

  if (!voucherId || typeof price !== "number") {
    return (
      <div className="transaction-container">
        <h1>Lỗi</h1>
        <p>{message || "Thông tin voucher không hợp lệ."}</p>
        <button onClick={() => navigate(-1)} className="confirm-button">
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="transaction-container">
        <h1>Xác Nhận Thanh Toán</h1>
        <div className="transaction-details">
          <p>
            <strong>Voucher:</strong> {voucherName}
          </p>
          <p>
            <strong>Giá:</strong>{" "}
            {price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>

        <div className="payment-options">
          <h2>Chọn Phương Thức Thanh Toán</h2>
          <div className="payment-method-option">
            <label>
              <input
                type="radio"
                value="momo"
                name="paymentOption"
                checked={selectedPaymentOption === "momo"}
                onChange={handlePaymentOptionChange}
              />{" "}
              Momo
            </label>
          </div>
          <div className="payment-method-option">
            <label>
              <input
                type="radio"
                value="vietqr_bank_transfer"
                name="paymentOption"
                checked={selectedPaymentOption === "vietqr_bank_transfer"}
                onChange={handlePaymentOptionChange}
              />{" "}
              Chuyển khoản ngân hàng
            </label>
          </div>
          <div className="payment-method-option">
            <label>
              <input
                type="radio"
                value="vnpay"
                name="paymentOption"
                checked={selectedPaymentOption === "vnpay"}
                onChange={handlePaymentOptionChange}
              />{" "}
              Thanh toán qua VNPAY
            </label>
          </div>
        </div>

        {selectedPaymentOption && (
          <div className="payment-instruction">
            {renderPaymentInstructions()}
          </div>
        )}

        <button
          onClick={handleTransaction}
          className="confirm-button"
          disabled={
            isLoadingSellerInfo ||
            isProcessing ||
            !selectedPaymentOption ||
            !voucherId ||
            typeof price !== "number"
          }
        >
          {isProcessing ? "Đang xử lý..." :
            selectedPaymentOption === "vnpay" ? "Thanh Toán Qua VNPAY" : "Xác Nhận Đã Thanh Toán"}
        </button>

        {message && (
          <div
            className={`message ${message.toLowerCase().includes("success") ? "success" : "error"}`}
          >
            {message}
          </div>
        )}
      </div>
      <footer className="mt-12 bg-blue-50 rounded-2xl p-6 shadow-inner text-center">
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Nền tảng <strong>mua bán voucher</strong> uy tín với hàng ngàn{" "}
          <strong>mã giảm giá</strong> hấp dẫn từ Shopee, Lazada, Tiki,
          Amazon,... Cập nhật mỗi ngày, giúp bạn{" "}
          <strong>tiết kiệm chi phí</strong> và mua sắm thông minh hơn.
        </p>
      </footer>
      <footer className="mt-24 text-center text-gray-500 pb-8">
        <div>
          <p>© 2025 Voucher Exchange. All rights reserved.</p>
          <p className="mt-2">
            Liên hệ:{" "}
            <a
              href="mailto:support@voucher-exchange.com"
              className="text-green-600 hover:underline"
            >
              support@voucher-exchange.com
            </a>
            {" | "}
            <a
              href="https://facebook.com/voucher"
              className="text-green-600 hover:underline"
            >
              fb.com/voucher
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default TransactionPage;