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
} from "antd";
import { AuthContext } from "../../components/context/auth.context";
import { getVoucher } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "antd";

const { Title } = Typography;

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const [userVouchers, setUserVouchers] = useState([]);
  const [qrVisible, setQrVisible] = useState(false);

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${
    auth.user.image
  }`;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserVouchers = async () => {
      try {
        const res = await getVoucher();
        const vouchers = res?.data?.data?.vouchers || [];
        const filtered = vouchers.filter(
          (v) => v.createdBy === auth.user.id || v.createdBy === auth.user._id
        );
        setUserVouchers(filtered);
      } catch (error) {
        message.error("Lấy danh sách voucher thất bại");
        console.log(err);
      }
    };

    fetchUserVouchers();
  }, [auth.user.id]);

  return (
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
                Giảm: {item.discountValue}đ – Hạn:{" "}
                {dayjs(item.expirationDate).format("DD/MM/YYYY")}
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                <Tag color="blue">{item.platform}</Tag>
                <Tag color={item.isActive ? "green" : "red"}>
                  {item.isActive ? "Có sẵn" : "Hết hạn"}
                </Tag>
              </div>

              <Button
                className="mt-2 w-full sm:w-auto"
                style={{
                  border: "1px solid #1677ff",
                  color: "#1677ff",
                  fontWeight: 500,
                  padding: 16,
                }}
                type="default"
                size="small"
                onClick={() => {
                  navigate("/order", {
                    state: {
                      voucherId: item._id,
                      voucherName: `Giảm ${item.discountValue}% đơn tối thiểu ${item.minimumOrder}đ`,
                      price: item.price,
                    },
                  });
                }}
              >
                Sử dụng ngay
              </Button>
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
    </div>
  );
};

export default Profile;
