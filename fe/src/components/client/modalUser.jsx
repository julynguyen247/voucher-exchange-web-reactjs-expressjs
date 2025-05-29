import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Button, Avatar, Divider, Tag } from "antd";
import { getVoucher } from "../../utils/api";

const ModalUser = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [hasVoucher, setHasVoucher] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${
    user.image
  }`;

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await getVoucher();
        const vouchers = res?.data?.data?.vouchers || [];

        const createdByUser = vouchers.some(
          (voucher) => voucher.createdBy === user._id
        );

        setHasVoucher(createdByUser);
      } catch (error) {
        console.error("Lỗi khi kiểm tra voucher:", error);
      }
    };

    if (open) {
      fetchVoucher();
    }
  }, [open, user._id]);

  return (
    <>
      <Button type="link" onClick={showDrawer}>
        {user.name}
      </Button>

      <Drawer
        title="Thông tin người dùng"
        placement="right"
        onClose={onClose}
        open={open}
        width={360}
      >
        <div className="flex flex-col items-center mb-6">
          <Avatar
            src={urlAvatar}
            size={100}
            style={{ border: "2px solid #eee" }}
          />
          <div className="mt-2 font-semibold text-lg">{user.name}</div>
        </div>

        <Divider />

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>

          <Descriptions.Item label="Đã tạo voucher?">
            {hasVoucher ? (
              <Tag color="green">Đã tạo</Tag>
            ) : (
              <Tag color="red">Chưa tạo</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default ModalUser;
