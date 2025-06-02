import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  List,
  Tag,
  Typography,
  message,
  Modal,
} from "antd";
import { AuthContext } from "../../components/context/auth.context";
import { getVoucher, deleteVoucherApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import VoucherUpdate from "../../components/client/voucher/voucherUpdate";

const { Title } = Typography;

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const [userVouchers, setUserVouchers] = useState([]);
  const [qrVisible, setQrVisible] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${auth.user.image
    }`;
  const navigate = useNavigate();

  const fetchUserVouchers = async () => {
    try {
      const res = await getVoucher();
      const vouchers = res?.data?.data?.vouchers || [];
      const filtered = vouchers.filter(
        (v) => v.createdBy && v.createdBy._id?.toString() === auth.user.id
      );
      setUserVouchers(filtered);
    } catch (error) {
      message.error("Lấy danh sách voucher thất bại");
    }
  };

  useEffect(() => {
    fetchUserVouchers();
  }, [auth.user.id]);

  const handleDelete = (id, title) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa voucher này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteVoucherApi(id);
          message.success("Đã xóa voucher");
          fetchUserVouchers();
        } catch (err) {
          message.error("Xóa voucher thất bại");
        }
      },
    });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <Card className="shadow-md">
          <div className="flex flex-col items-center gap-4">
            <Avatar
              src={urlAvatar}
              size={120}
              style={{ border: "2px solid #1677ff" }}
            />
            <Title level={3}>{auth.user.name}</Title>
          </div>

          <Divider />

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Email">{auth.user.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {auth.user.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Ngân hàng">
              {auth.user.bank}
            </Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">
              {auth.user.accountNumber}
            </Descriptions.Item>
          </Descriptions>
          <div className="mt-2 flex items-center justify-center">
            <Button
              type="default"
              size="large"
              style={{
                color: "#1677ff",
                border: "1px solid #1677ff",
                fontWeight: 500,
              }}
              onClick={() => setQrVisible(true)}
            >
              Tạo mã QR cá nhân
            </Button>
          </div>
        </Card>

        <Divider orientation="left" className="mt-10">
          Voucher đã tạo
        </Divider>

        <List
          bordered
          dataSource={userVouchers}
          locale={{ emptyText: "Chưa có voucher nào." }}
          renderItem={(item) => (
            <List.Item>
              <div className="flex flex-col w-full">
                <span className="font-semibold text-blue-600">{item.title}</span>
                <span className="text-sm text-gray-500">
                  Giảm: {item.discountValue}% – Hạn:{" "}
                  {dayjs(item.expirationDate).format("DD/MM/YYYY")}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Tag color="blue">{item.platform}</Tag>
                  <Tag color={item.isActive ? "green" : "red"}>
                    {item.isActive ? "Có sẵn" : "Hết hạn"}
                  </Tag>
                </div>

                <div className="flex gap-3 mt-2 flex-wrap">
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setSelectedVoucher(item);
                      setEditModalOpen(true);
                    }}
                  >
                    Cập nhật
                  </Button>

                  <Button
                    danger
                    size="small"
                    onClick={() => handleDelete(item._id, item.title)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />

        <Modal
          open={qrVisible}
          onCancel={() => setQrVisible(false)}
          footer={null}
          title="QR Đến Trang Cá Nhân"
          centered
        >
          <div className="flex justify-center items-center flex-col gap-4 mt-4">
            <QRCodeCanvas
              value={`${window.location.origin}/profile/${auth.user.id}`}
              size={200}
            />
            <div className="text-sm text-gray-500 text-center">
              Quét mã để xem trang cá nhân của tôi
            </div>
          </div>
        </Modal>

        <VoucherUpdate
          open={editModalOpen}
          voucher={selectedVoucher}
          onCancel={() => setEditModalOpen(false)}
          onUpdated={fetchUserVouchers}
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

export default Profile;
