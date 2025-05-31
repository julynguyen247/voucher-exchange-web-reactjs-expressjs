import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../style/orderPage.css"; // Đảm bảo bạn có file CSS riêng để cải thiện giao diện

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { voucherId, voucherName, price, userId } = location.state || {};
  console.log(voucherId);
  const handlePayment = () => {
    navigate("/transaction", {
      state: { voucherId, voucherName, price, userId },
    });
  };

  return (
    <div className="order-container">
      <div className="order-card">
        <h1 className="order-title">Thông tin đơn hàng</h1>
        <div className="order-details">
          <p className="order-detail">
            <strong>Voucher:</strong> {voucherName}
          </p>
          <p className="order-detail">
            <strong>Giá:</strong> {price} VND
          </p>
        </div>
        <button className="payment-button" onClick={handlePayment}>
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  );
};

export default OrderPage;
