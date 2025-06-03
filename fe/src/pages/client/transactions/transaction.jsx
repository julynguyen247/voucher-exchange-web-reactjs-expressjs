import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../style/transactionPage.css";
import { QRCode, Radio, Button, Spin, Alert, Typography, Card, Space, Image, message as antdMessage } from "antd";
import {
  CreditCardOutlined,
  MobileOutlined,
  BankOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  processTransaction,
  getSellerPaymentDetails,
  createVnpayPayment,
} from "../../../utils/api";
import { AuthContext } from "../../../components/context/auth.context";

const { Title, Text, Paragraph } = Typography;

const TransactionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { voucherId, voucherName = "Không có thông tin", price } = location.state || {};
  const { auth } = useContext(AuthContext);

  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerBankAccount, setSellerBankAccount] = useState("");
  const [sellerBankName, setSellerBankName] = useState("");
  const [sellerAccountHolderName, setSellerAccountHolderName] = useState("");

  const [isLoadingSellerInfo, setIsLoadingSellerInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!voucherId || typeof price !== "number") {
      console.error("Thông tin voucher không hợp lệ.");
    }
  }, [voucherId, price]);

  const handlePaymentOptionChange = async (e) => {
    const newPaymentOption = e.target.value;
    setSelectedPaymentOption(newPaymentOption);
    setSellerPhone("");
    setSellerBankAccount("");
    setSellerBankName("");
    setSellerAccountHolderName("");

    if (newPaymentOption === "vnpay" || !newPaymentOption) {
      return;
    }

    setIsLoadingSellerInfo(true);
    try {
      const response = await getSellerPaymentDetails(voucherId, newPaymentOption);
      if (response.data && response.data.EC === 0) {
        const details = response.data.data;
        if (newPaymentOption === "momo") {
          setSellerPhone(details.sellerPhone || "");
          if (!details.sellerPhone) {
            antdMessage.error(`Người bán chưa cung cấp SĐT Momo.`);
          }
        } else if (newPaymentOption === "vietqr_bank_transfer") {
          setSellerBankName(details.sellerBankName || "");
          setSellerBankAccount(details.sellerBankAccount || "");
          setSellerAccountHolderName(details.sellerAccountHolderName || "");
          if (!details.sellerBankName || !details.sellerBankAccount || !details.sellerAccountHolderName) {
            antdMessage.error("Người bán chưa cập nhật đủ thông tin tài khoản ngân hàng.");
          }
        }
      } else {
        antdMessage.error(response.data?.message || `Không thể lấy thông tin cho ${newPaymentOption}.`);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thanh toán:", error);
      antdMessage.error(error.response?.data?.message || "Lỗi kết nối khi lấy thông tin thanh toán.");
    } finally {
      setIsLoadingSellerInfo(false);
    }
  };

  const handleVnpayPayment = async () => {
    setIsProcessing(true);
    if (!auth?.user?.id) {
      antdMessage.error("Người dùng chưa được xác thực.");
      setIsProcessing(false);
      return;
    }
    try {
      const paymentData = { userId: auth.user.id, voucherId, voucherName, price };
      const response = await createVnpayPayment(paymentData);
      if (response.data && response.data.EC === 0 && response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        antdMessage.error(response.data?.message || "Không thể tạo thanh toán VNPAY. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán VNPAY:", error);
      antdMessage.error(error.response?.data?.message || "Lỗi khi xử lý yêu cầu thanh toán VNPAY.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransaction = async () => {
    if (!auth?.user?.id) {
      antdMessage.error("Người dùng chưa được xác thực.");
      return;
    }
    if (!selectedPaymentOption) {
      antdMessage.warning("Vui lòng chọn một phương thức thanh toán.");
      return;
    }
    if (isLoadingSellerInfo) {
      antdMessage.info("Đang tải thông tin người bán, vui lòng đợi.");
      return;
    }

    if (selectedPaymentOption === "vnpay") {
      handleVnpayPayment();
      return;
    }

    if (selectedPaymentOption === "momo" && !sellerPhone) {
      antdMessage.error("Thông tin SĐT Momo của người bán chưa sẵn sàng. Vui lòng chọn lại hoặc thử lại sau.");
      return;
    }
    if (selectedPaymentOption === "vietqr_bank_transfer" && (!sellerBankAccount || !sellerBankName || !sellerAccountHolderName)) {
      antdMessage.error("Thông tin tài khoản ngân hàng của người bán chưa sẵn sàng. Vui lòng chọn lại hoặc thử lại sau.");
      return;
    }

    setIsProcessing(true);
    try {
      const transactionData = {
        userId: auth.user.id,
        voucherId,
        voucherName,
        price,
        paymentMethod: selectedPaymentOption,
        status: "Pending",
        deleted: false
      };
      const response = await processTransaction(transactionData);
      if (response.data && response.data.EC === 0) {
        antdMessage.success(response.data.message || "Yêu cầu thanh toán đã được ghi nhận! Vui lòng hoàn tất thanh toán và chờ xác nhận.");
        setTimeout(() => {
          navigate("/transaction-history");
        }, 2500);
      } else {
        antdMessage.success(response.data?.message || "Giao dịch thành công.");
      }
    } catch (error) {
      antdMessage.error(error.response?.data?.message || "Lỗi khi xử lý giao dịch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentInstructions = () => {
    if (isLoadingSellerInfo) {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin tip="Đang tải thông tin thanh toán..." size="large" />
        </div>
      );
    }

    if (selectedPaymentOption === "vnpay") {
      return (
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '20px 0' }}>
          <Image
            src="/vnpay-logo.png"
            alt="VNPAY Logo"
            width={120}
            preview={false}
            style={{ marginBottom: 16 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <Paragraph style={{ textAlign: 'center', maxWidth: 400 }}>
            Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch.
            VNPAY hỗ trợ thanh toán bằng QR Code, thẻ ATM nội địa, thẻ quốc tế và ví điện tử.
          </Paragraph>
        </Space>
      );
    }

    if (selectedPaymentOption === "momo" && sellerPhone) {
      const momoQRCodeValue = `2|99|${sellerPhone}|||${price}|${encodeURIComponent(
        `TT ${voucherName.substring(0, 15)} ID ${voucherId}`
      )}|0|0`;
      return (
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '20px 0' }}>
          <Title level={5} style={{ marginBottom: 0 }}>Quét mã QR để thanh toán Momo</Title>
          <QRCode value={momoQRCodeValue} size={180} style={{ margin: "16px 0" }} />
          <Paragraph><strong>SĐT người nhận:</strong> <Text copyable>{sellerPhone}</Text></Paragraph>
          <Paragraph><strong>Số tiền:</strong> <Text strong style={{ color: '#fa8c16' }}>{price.toLocaleString("vi-VN")} VND</Text></Paragraph>
          <Paragraph><strong>Nội dung:</strong> <Text copyable>{`TT ${voucherName.substring(0, 15)} ID ${voucherId}`}</Text></Paragraph>
          <Alert message="Sau khi thanh toán, vui lòng nhấn nút 'Xác Nhận Đã Thanh Toán' bên dưới." type="info" showIcon style={{ marginTop: 10, maxWidth: 400 }} />
        </Space>
      );
    }

    if (selectedPaymentOption === "vietqr_bank_transfer" && sellerBankAccount && sellerBankName && sellerAccountHolderName) {
      return (
        <Space direction="vertical" style={{ width: '100%', padding: '20px 0', alignItems: 'flex-start' }}>
          <Title level={5}>Thông tin chuyển khoản ngân hàng</Title>
          <Paragraph><strong>Ngân hàng:</strong> {sellerBankName.toUpperCase()}</Paragraph>
          <Paragraph><strong>Chủ tài khoản:</strong> {sellerAccountHolderName}</Paragraph>
          <Paragraph><strong>Số tài khoản:</strong> <Text copyable>{sellerBankAccount}</Text></Paragraph>
          <Paragraph><strong>Số tiền:</strong> <Text strong style={{ color: '#fa8c16' }}>{price.toLocaleString("vi-VN")} VND</Text></Paragraph>
          <Paragraph><strong>Nội dung:</strong> <Text copyable>{`TT ${voucherName.substring(0, 15)} ID ${voucherId}`}</Text></Paragraph>
          <Alert message="Sau khi chuyển khoản, vui lòng nhấn nút 'Xác Nhận Đã Thanh Toán' bên dưới." type="info" showIcon style={{ marginTop: 10, width: '100%' }} />
        </Space>
      );
    }
    // Xử lý trường hợp thông tin chưa tải xong hoặc lỗi tải cụ thể cho từng phương thức
    if (selectedPaymentOption === "momo" && !sellerPhone && !isLoadingSellerInfo) {
      return <Alert message="Không thể tải thông tin SĐT Momo của người bán. Vui lòng thử lại hoặc chọn phương thức khác." type="warning" showIcon style={{ marginTop: 16 }} />;
    }
    if (selectedPaymentOption === "vietqr_bank_transfer" && (!sellerBankAccount || !sellerBankName || !sellerAccountHolderName) && !isLoadingSellerInfo) {
      return <Alert message="Không thể tải thông tin tài khoản ngân hàng của người bán. Vui lòng thử lại hoặc chọn phương thức khác." type="warning" showIcon style={{ marginTop: 16 }} />;
    }
    return null;
  };

  if (!voucherId || typeof price !== "number") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: '20px' }}>
        <Alert
          message="Lỗi thông tin giao dịch"
          description="Thông tin voucher không hợp lệ hoặc đã có lỗi xảy ra. Vui lòng thử lại."
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px 0', minHeight: 'calc(100vh - 250px)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 600 }}>
          <Card>
            <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>Xác Nhận Thanh Toán</Title>
            <Paragraph>
              <strong>Voucher:</strong> {voucherName}
            </Paragraph>
            <Paragraph>
              <strong>Giá thanh toán:</strong>{" "}
              <Text strong style={{ color: '#fa8c16', fontSize: '18px' }}>
                {price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </Paragraph>
          </Card>

          <Card title={<Title level={4} style={{ margin: 0 }}>Chọn Phương Thức Thanh Toán</Title>}>
            <Radio.Group
              onChange={handlePaymentOptionChange}
              value={selectedPaymentOption}
              style={{ width: '100%' }}
              optionType="button"
              buttonStyle="solid"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Button value="momo" style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '10px 15px', whiteSpace: 'normal' }}>
                  <Space><MobileOutlined /> Thanh toán qua Momo</Space>
                </Radio.Button>
                <Radio.Button value="vietqr_bank_transfer" style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '10px 15px', whiteSpace: 'normal' }}>
                  <Space><BankOutlined /> Chuyển khoản ngân hàng</Space>
                </Radio.Button>
                <Radio.Button value="vnpay" style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '10px 15px', whiteSpace: 'normal' }}>
                  <Space><CreditCardOutlined /> Thanh toán qua VNPAY</Space>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Card>

          {selectedPaymentOption && (
            <Card title={<Title level={4} style={{ margin: 0 }}>Hướng Dẫn Thanh Toán</Title>}>
              {renderPaymentInstructions()}
            </Card>
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={handleTransaction}
            loading={isProcessing}
            disabled={
              isLoadingSellerInfo ||
              isProcessing ||
              !selectedPaymentOption ||
              (selectedPaymentOption === "momo" && !sellerPhone && !isLoadingSellerInfo) ||
              (selectedPaymentOption === "vietqr_bank_transfer" && (!sellerBankAccount || !sellerBankName || !sellerAccountHolderName) && !isLoadingSellerInfo)
            }
            style={{ fontWeight: 'bold', marginTop: '8px' }}
          >
            {isProcessing ? "Đang xử lý..." :
              selectedPaymentOption === "vnpay" ? "Tiến Hành Thanh Toán Qua VNPAY" : "Xác Nhận Đã Thanh Toán"}
          </Button>
        </Space>
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

export default TransactionPage;