import { Tabs } from "antd";
import React from "react";
import Info from "./info";
import ChangePassword from "./changePassword";

const AccountPage = () => {
  const items = [
    {
      key: "1",
      label: "Đổi thông tin người dùng",
      children: <Info></Info>,
    },
    {
      key: "2",
      label: "Đổi mật khẩu",
      children: <ChangePassword></ChangePassword>,
    },
  ];
  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} centered tabBarGutter={50} />
    </div>
  );
};

export default AccountPage;
