import React, { useState } from "react";
import { processTransaction } from "../../utils/api"; // Import the named export

const TransactionPage = () => {
  const [voucherId, setVoucherId] = useState("");
  const [message, setMessage] = useState("");

  const handleTransaction = async () => {
    try {
      const userId = "USER_ID"; // Replace with the logged-in user's ID
      const response = await processTransaction(userId, voucherId); // Call the correct API
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <div>
      <h1>Transaction Page</h1>
      <input
        type="text"
        placeholder="Enter Voucher ID"
        value={voucherId}
        onChange={(e) => setVoucherId(e.target.value)}
      />
      <button onClick={handleTransaction}>Process Transaction</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TransactionPage;
