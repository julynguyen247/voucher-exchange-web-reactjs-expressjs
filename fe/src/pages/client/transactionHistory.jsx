import React, { useEffect, useState, useContext } from "react";
import { Table, Tag } from "antd";
import { getTransactions } from "../../utils/api";
import { AuthContext } from "../../components/context/auth.context";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = auth?.user?.id;

        console.log("Fetching transactions for userId:", userId);

        const response = await getTransactions();
        console.log("API Response:", response);
        if (response.data) {
          setTransactions(response.data.data || []);
        } else {
          setMessage(response.data.message || "Failed to fetch transactions.");
        }
      } catch (error) {
        console.error(
          "Failed to fetch transactions:",
          error.response?.data || error.message
        );
        setMessage(
          error.response?.data?.message || "Failed to fetch transactions."
        );
      }
    };

    fetchTransactions();
  }, [auth]);

  const columns = [
    {
      title: "Voucher Name",
      dataIndex: "voucherName",
      key: "voucherName",
      render: (text) => text || "N/A",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} VND`,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) =>
        method === "cash"
          ? "Cash"
          : method === "bank_transfer"
          ? "Bank Transfer"
          : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Completed" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <h1>Transaction History</h1>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <Table
        dataSource={Array.isArray(transactions) ? transactions : []}
        columns={columns}
        rowKey="_id"
      />
    </div>
  );
};

export default TransactionHistory;
