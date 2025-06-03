import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Button, Typography, Alert, Space } from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "../../../style/orderPage.css";

const { Title, Text, Paragraph } = Typography;

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { voucherId, voucherName = "Không có thông tin", price, userId } = location.state || {};

  const handlePayment = () => {
    if (voucherId && typeof price === 'number') {
      navigate("/transaction", {
        state: { voucherId, voucherName, price, userId },
      });
    } else {
      console.error("Thông tin voucher không hợp lệ để thanh toán.");
    }
  };

  if (!voucherId || typeof price !== 'number') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: '20px' }}>
        <Alert
          message="Lỗi thông tin đơn hàng"
          description="Không tìm thấy thông tin chi tiết của voucher hoặc giá không hợp lệ. Vui lòng thử lại."
          type="error"
          showIcon
          style={{ marginBottom: 24, maxWidth: 600, textAlign: 'left' }}
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          size="large"
        >
          Quay Lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 250px)', padding: '20px 0' }}>
        <Card
          title={
            <Space align="center">
              <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0 }}>Thông tin đơn hàng</Title>
            </Space>
          }
          style={{ width: '100%', maxWidth: 500, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
          bordered={false} // Bỏ border mặc định nếu muốn
        >
          <Paragraph style={{ fontSize: '16px' }}>
            <Text strong>Voucher:</Text> {voucherName}
          </Paragraph>
          <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
            <Text strong>Giá thanh toán:</Text>{" "}
            <Text strong style={{ color: '#fa8c16', fontSize: '18px' }}>
              {price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </Text>
          </Paragraph>
          <Button
            type="primary"
            size="large"
            block // Nút chiếm toàn bộ chiều rộng của Card
            onClick={handlePayment}
            style={{ fontWeight: 'bold' }}
          >
            Xác nhận và Thanh toán
          </Button>
        </Card>
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

export default OrderPage;
