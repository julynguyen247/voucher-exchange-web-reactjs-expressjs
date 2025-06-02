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

  // ...existing code...
  return (
    <>
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

export default OrderPage;
