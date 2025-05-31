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

    /*if (newPaymentOption === "vnpay") {
      return;
    }
    */

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
        status: "pending"
      };

      const response = await processTransaction(transactionData);
      if (response.data && response.data.EC === 0) {
        setMessage(response.data.message || "Giao dịch thành công!");
      } else {
        setMessage(response.data?.message || "Giao dịch thất bại.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi khi xử lý giao dịch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getBankBin = (bankNameKey) => {
    const bankBins = {
      vietcombank: "970436",
      techcombank: "970407",
      acb: "970416",
      mbbank: "970422",
      vpbank: "970432",
      bidv: "970418",
      viettinbank: "970415",
      agribank: "970405",
      sacombank: "970403",
      dongabank: "970406",
    };
    const normalizedKey = bankNameKey
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
    return bankBins[normalizedKey];
  };

  const generateVietQRImageUrl = (
    sellerBank,
    accountNo,
    accountHolder,
    amount,
    description
  ) => {
    const bankBin = getBankBin(sellerBank);
    if (!bankBin || !accountNo || typeof amount !== "number" || amount <= 0)
      return null;
    const template = "compact2";
    let qrImageUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
      description
    )}`;
    if (accountHolder) {
      qrImageUrl += `&accountName=${encodeURIComponent(
        accountHolder.toUpperCase()
      )}`;
    }
    return qrImageUrl;
  };

  // Render phần hướng dẫn thanh toán theo phương thức
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
          <QRCode
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
          <img
            src={generateVietQRImageUrl(
              sellerBankName,
              sellerBankAccount,
              sellerAccountHolderName,
              price,
              `TT VCR ${voucherName.substring(0, 10)} ${auth.user?.id?.slice(-4) || ""}`
            )}
            alt={`VietQR cho ${sellerBankName}`}
            style={{
              width: 256,
              height: "auto",
              display: "block",
              margin: "10px auto",
              border: "1px solid #eee",
            }}
          />
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
            Chuyển khoản ngân hàng (VietQR)
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
          className={`message ${message.toLowerCase().includes("thành công") ? "success" : "error"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default TransactionPage;