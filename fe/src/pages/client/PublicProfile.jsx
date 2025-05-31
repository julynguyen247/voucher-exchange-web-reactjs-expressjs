import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Descriptions,
  Divider,
  Tag,
  Typography,
  List,
  message,
} from "antd";
import { useParams } from "react-router-dom";
import { getVoucher, getUserByIdApi } from "../../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;
const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getUserByIdApi(id);
        setUser(userRes.data.data);
        const res = await getVoucher();
        const vouchers = res?.data?.data?.vouchers || [];
        console.log(vouchers);
        const filtered = vouchers.filter(
          (v) => v.createdBy && v.createdBy._id?.toString() === id
        );

        setVouchers(filtered);
      } catch (err) {
        message.error("Không thể tải dữ liệu người dùng.");
        console.log(err);
      }
    };

    fetchData();
  }, [id]);

  if (!user) return null;

  const avatarUrl = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${
    user.image
  }`;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Card className="shadow-md">
        <div className="flex flex-col items-center gap-4">
          <Avatar src={avatarUrl} size={120} />
          <Title level={3}>{user.name}</Title>
        </div>

        <Divider />

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {user.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Ngân hàng">{user.bank}</Descriptions.Item>
          <Descriptions.Item label="Số tài khoản">
            {user.accountNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider orientation="left" className="mt-10">
        Voucher đã tạo
      </Divider>

      <List
        bordered
        dataSource={vouchers}
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
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PublicProfile;
