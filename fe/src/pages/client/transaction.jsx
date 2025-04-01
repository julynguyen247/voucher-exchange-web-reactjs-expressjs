import React, { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { processTransaction } from "../../utils/api";
import { AuthContext } from "../../components/context/auth.context";

const TransactionPage = () => {
  const location = useLocation();
  const { voucherId, voucherName, price } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);

  const handleTransaction = async () => {
    try {
      const userId = auth?.user?.id;

      if (!userId) {
        setMessage("User is not authenticated.");
        return;
      }

      const transactionData = {
        userId,
        voucherId,
        voucherName,
        price,
        paymentMethod,
      };
      console.log("userId:", userId);
      console.log("voucherId:", voucherId);
      console.log("voucherName:", voucherName);
      console.log("price:", price);
      console.log("paymentMethod:", paymentMethod);

      console.log("Sending transaction data:", transactionData);

      const response = await processTransaction(transactionData);
      console.log("API Response:", response);
      setMessage(response.data.message);
    } catch (error) {
      console.error(
        "Transaction failed:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || error.message || "Transaction failed";
      setMessage(errorMessage);
    }
  };

  return (
    <div>
      <h1>Transaction Page</h1>
      <p>Voucher: {voucherName}</p>
      <p>Price: {price} VND</p>
      <div>
        <label>
          <input
            type="radio"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => setPaymentMethod("cash")}
          />
          Pay with Cash
        </label>
        <label>
          <input
            type="radio"
            value="bank_transfer"
            checked={paymentMethod === "bank_transfer"}
            onChange={() => setPaymentMethod("bank_transfer")}
          />
          Pay with Bank Transfer
        </label>
        {paymentMethod === "bank_transfer" && (
          <div>
            <p>Select Bank:</p>
            <select>
              <option value="momo">Momo</option>
              <option value="zalo_pay">Zalo Pay</option>
              <option value="vietcombank">Vietcombank</option>
              <option value="techcombank">Techcombank</option>
            </select>
          </div>
        )}
      </div>
      <button onClick={handleTransaction}>Confirm Payment</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TransactionPage;
