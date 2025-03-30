import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { getTransactions } from "../../utils/api"; // Import the named export

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = "USER_ID"; // Replace with the logged-in user's ID
        const response = await getTransactions(userId); // Use the named export
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const columns = [
    {
      title: "Voucher",
      dataIndex: "voucher",
      key: "voucher",
      render: (text, record) => record.voucherId?.name || "N/A",
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
      <Table dataSource={transactions} columns={columns} rowKey="_id" />
    </div>
  );
};

export default TransactionHistory;
