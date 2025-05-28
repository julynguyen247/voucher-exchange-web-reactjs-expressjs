import React, { useEffect, useState, useContext } from "react";
import { Table, Tag } from "antd";

import { getTransactions } from "../../../utils/api";
import { AuthContext } from "../../../components/context/auth.context";

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
      title: "Voucher",
      dataIndex: "voucherName",
      key: "voucherName",
      render: (text) => text || "N/A",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} VND`,
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) =>
        method === "momo"
          ? "Momo"
          : method === "vietqr_bank_transfer"
            ? "Chuyển khoản ngân hàng"
            : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";

        switch (status) {
          case "Pending":
            color = "orange";
            text = "Đang chờ";
            break;
          case "Completed":
            color = "green";
            text = "Hoàn thành";
            break;
          case "Failed":
            color = "red";
            text = "Thất bại";
            break;
          default:
            color = "gray";
            text = status || "Không xác định";
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <h1>Lịch sử giao dịch</h1>
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
