import React, { useEffect, useState, useContext } from "react";
import { Input, Table, Tag, Select, DatePicker, Button, Row, Col, Spin, Modal, Space } from "antd";
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';

import { getTransactions } from "../../../utils/api";
import { AuthContext } from "../../../components/context/auth.context";

const { RangePicker } = DatePicker;

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");

  const [appliedFilterStatus, setAppliedFilterStatus] = useState(null);
  const [appliedFilterPaymentMethod, setAppliedFilterPaymentMethod] = useState(null);
  const [appliedFilterDateRange, setAppliedFilterDateRange] = useState(null);

  const [tempFilterStatus, setTempFilterStatus] = useState(null);
  const [tempFilterPaymentMethod, setTempFilterPaymentMethod] = useState(null);
  const [tempFilterDateRange, setTempFilterDateRange] = useState(null);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = auth?.user?.id;
        const response = await getTransactions();
        if (response.data && response.data.data) {
          setTransactions(response.data.data);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to fetch transactions."
        );
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user?.id) {
      fetchTransactions();
    } else {
      setLoading(false);
      setTransactions([]);
    }
  }, [auth]);

  useEffect(() => {
    let currentTransactions = [...transactions];

    if (searchText) {
      currentTransactions = currentTransactions.filter((transaction) =>
        transaction.voucherName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (appliedFilterStatus) {
      currentTransactions = currentTransactions.filter(
        (transaction) => transaction.status === appliedFilterStatus
      );
    }

    if (appliedFilterPaymentMethod) {
      currentTransactions = currentTransactions.filter(
        (transaction) => transaction.paymentMethod === appliedFilterPaymentMethod
      );
    }

    if (appliedFilterDateRange && appliedFilterDateRange.length === 2) {
      const [startDate, endDate] = appliedFilterDateRange;
      currentTransactions = currentTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    setFilteredTransactions(currentTransactions);
  }, [searchText, appliedFilterStatus, appliedFilterPaymentMethod, appliedFilterDateRange, transactions]);


  const handleSearch = (value) => {
    setSearchText(value);
  };

  const showFilterModal = () => {
    setTempFilterStatus(appliedFilterStatus);
    setTempFilterPaymentMethod(appliedFilterPaymentMethod);
    setTempFilterDateRange(appliedFilterDateRange);
    setIsFilterModalVisible(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilterStatus(tempFilterStatus);
    setAppliedFilterPaymentMethod(tempFilterPaymentMethod);
    setAppliedFilterDateRange(tempFilterDateRange);
    setIsFilterModalVisible(false);
  };

  const handleClearModalFilters = () => {
    setTempFilterStatus(null);
    setTempFilterPaymentMethod(null);
    setTempFilterDateRange(null);
  };

  const handleClearAllFilters = () => {
    setSearchText("");
    setAppliedFilterStatus(null);
    setAppliedFilterPaymentMethod(null);
    setAppliedFilterDateRange(null);
    setTempFilterStatus(null);
    setTempFilterPaymentMethod(null);
    setTempFilterDateRange(null);
  };


  const handleModalCancel = () => {
    setIsFilterModalVisible(false);
  };

  const columns = [
    {
      title: "Voucher",
      dataIndex: "voucherName",
      key: "voucherName",
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>
          {typeof price === 'number' ? price.toLocaleString("vi-VN") : 'N/A'} VND
        </span>
      ),
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
      render: (method) => {
        if (method === "momo") return "Momo";
        if (method === "vietqr_bank_transfer") return "Chuyển khoản ngân hàng";
        if (method === "vnpay") return "VNPay";
        return "Không xác định";
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";
        switch (status) {
          case "Pending": color = "orange"; text = "Đang chờ"; break;
          case "Completed": color = "green"; text = "Hoàn thành"; break;
          case "Failed": color = "red"; text = "Thất bại"; break;
          default: color = "gray"; text = status || "Không xác định"; break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? new Date(date).toLocaleString("vi-VN") : 'N/A',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }} justify="space-between" align="middle">
        <Col>
          <h1 className="text-2xl md:text-3xl font-bold">
            Lịch sử giao dịch
          </h1>
        </Col>
        <Col xs={24} sm={12} md={10} lg={8}>
          <Input.Search
            placeholder="Tìm theo tên voucher..."
            onSearch={handleSearch}
            onChange={(e) => { if (e.target.value === "") setSearchText(""); }}
            enterButton={
              <Button
                icon={<SearchOutlined />}
                type="primary"
                aria-label="Tìm kiếm voucher"
              >
                Tìm kiếm
              </Button>
            }
            allowClear
            defaultValue={searchText}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }} justify="space-between" align="middle">
        <Col xs={24} sm={12} md={14} lg={16}>
          <p className="description" style={{ margin: 0 }}>
            Xem lại các giao dịch đã thực hiện.
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={showFilterModal}
              aria-label="Mở bộ lọc giao dịch"
            >
              Bộ lọc
            </Button>
            <Button onClick={handleClearAllFilters}>
              Xóa tất cả bộ lọc
            </Button>
          </Space>
        </Col>
      </Row>

      <Modal
        title={<h2 id="filter-modal-title">Bộ lọc giao dịch</h2>}
        visible={isFilterModalVisible}
        onCancel={handleModalCancel}
        aria-labelledby="filter-modal-title"
        footer={[
          <Button key="clear" onClick={handleClearModalFilters}>
            Xóa lựa chọn trong bộ lọc
          </Button>,
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleApplyFilters}>
            Áp dụng bộ lọc
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 8]} align="middle">
            <Col span={8}><label htmlFor="filter-status-select">Trạng thái:</label></Col>
            <Col span={16}>
              <Select
                id="filter-status-select" // Thêm ID
                placeholder="Chọn trạng thái"
                value={tempFilterStatus}
                onChange={(value) => setTempFilterStatus(value)}
                style={{ width: "100%" }}
                allowClear
              >
                <Select.Option value="Pending">Đang chờ</Select.Option>
                <Select.Option value="Completed">Hoàn thành</Select.Option>
                <Select.Option value="Failed">Thất bại</Select.Option>
              </Select>
            </Col>
          </Row>
          <Row gutter={[16, 8]} align="middle">
            <Col span={8}><label htmlFor="filter-payment-method-select">Phương thức thanh toán:</label></Col>
            <Col span={16}>
              <Select
                id="filter-payment-method-select" // Thêm ID
                placeholder="Chọn PTTT"
                value={tempFilterPaymentMethod}
                onChange={(value) => setTempFilterPaymentMethod(value)}
                style={{ width: "100%" }}
                allowClear
              >
                <Select.Option value="momo">Momo</Select.Option>
                <Select.Option value="vietqr_bank_transfer">Chuyển khoản NH</Select.Option>
                <Select.Option value="vnpay">VNPay</Select.Option>
              </Select>
            </Col>
          </Row>
          <Row gutter={[16, 8]} align="middle">
            <Col span={8}><label htmlFor="filter-date-range-picker">Khoảng ngày:</label></Col>
            <Col span={16}>
              <RangePicker
                id="filter-date-range-picker"
                style={{ width: "100%" }}
                value={tempFilterDateRange}
                onChange={(dates) => setTempFilterDateRange(dates)}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>
          </Row>
        </Space>
      </Modal>

      {message && <p style={{ color: "red", textAlign: 'center' }}>{message}</p>}

      {
        loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin spinning={loading} tip="Đang tải dữ liệu giao dịch..." size="large">
              <Table
                dataSource={filteredTransactions}
                columns={columns}
                rowKey="_id"
                scroll={{ x: true }}
                locale={{
                  emptyText: filteredTransactions.length === 0 && (searchText || appliedFilterStatus || appliedFilterPaymentMethod || appliedFilterDateRange)
                    ? 'Không có giao dịch nào phù hợp với tiêu chí lọc.'
                    : 'Chưa có giao dịch nào.'
                }}
              />
            </Spin>
          </div>
        ) : (
          <Table
            dataSource={filteredTransactions}
            columns={columns}
            rowKey="_id"
            scroll={{ x: true }}
            locale={{ emptyText: 'Không có giao dịch nào phù hợp.' }}
          />
        )
      }

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
    </div >
  );
};

export default TransactionHistory;