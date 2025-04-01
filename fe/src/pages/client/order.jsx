import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voucherId, voucherName, price } = location.state || {};

  const handlePayment = () => {
    navigate("/transaction", { state: { voucherId, voucherName, price } });
  };

  return (
    <div>
      <h1>Order Confirmation</h1>
      <p>Voucher Name: {voucherName}</p>
      <p>Price: {price} VND</p>
      <button onClick={handlePayment}>Proceed to Payment</button>
    </div>
  );
};

export default OrderPage;
