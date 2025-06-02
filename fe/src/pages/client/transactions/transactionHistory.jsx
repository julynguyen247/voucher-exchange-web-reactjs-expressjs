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
          console.log("Transactions Data:", response.data.data);
          setTransactions(response.data.data || []);
        }
      } catch (error) {
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
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (code, record) => {
        return record.status === "Completed" ? code : "Chưa hoàn tất giao dịch";
      },
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
            : method === "vnpay"
              ? "VNPay"
              : "Khhông xác định"
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
    <>
      <div>
        <h1>Lịch sử giao dịch</h1>
        {message && <p style={{ color: "red" }}>{message}</p>}
        <Table
          dataSource={Array.isArray(transactions) ? transactions : []}
          columns={columns}
          rowKey="_id"
        />
      </div>
      <footer className="mt-12 bg-blue-50 rounded-2xl p-6 shadow-inner text-center">
        <div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Nền tảng <strong>mua bán voucher</strong> uy tín với hàng ngàn{" "}
            <strong>mã giảm giá</strong> hấp dẫn từ Shopee, Lazada, Tiki,
            Amazon,... Cập nhật mỗi ngày, giúp bạn{" "}
            <strong>tiết kiệm chi phí</strong> và mua sắm thông minh hơn.
          </p>
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

export default TransactionHistory;
