import React, { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../utils/api";
import { Input, Tooltip, Drawer, Button } from "antd";
import {
  HeartOutlined,
  StarOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const AppHeader = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res && res.data) {
      localStorage.clear("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          email: "",
          name: "",
          phone: "",
          id: "",
          image: "",
        },
      });
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/images/upload/logo.jpg`}
            alt="logo"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <span className="text-xl font-bold text-green-600">VOUCHERS</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-gray-700 text-sm font-medium">
          <Link
            to="/"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Trang chủ
          </Link>
          <Link
            to="/category"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Ngành hàng
          </Link>
          <Link
            to="/voucher"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Mã giảm giá
          </Link>
          <Link
            to="/review"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Đánh giá
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Input
            placeholder="Tìm kiếm voucher..."
            suffix={<SearchOutlined />}
            className="w-52"
          />
          <Tooltip title="Đã lưu">
            <StarOutlined className="text-xl hover:text-green-600 cursor-pointer" />
          </Tooltip>
          <Tooltip title="Yêu thích">
            <HeartOutlined className="text-xl hover:text-green-600 cursor-pointer" />
          </Tooltip>

          {auth.isAuthenticated ? (
            <Tooltip title="Tài khoản">
              <Link to="/account">
                <img
                  src={auth.user.image || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              </Link>
            </Tooltip>
          ) : (
            <Tooltip title="Đăng nhập">
              <Link to="/login">
                <UserOutlined className="text-xl hover:text-green-600 cursor-pointer" />
              </Link>
            </Tooltip>
          )}
        </div>
        <div className="md:hidden lg:hidden">
          <Button
            type="text"
            icon={<MenuOutlined className="text-xl md:hidden" />}
            onClick={() => setDrawerVisible(true)}
          />
        </div>
      </div>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        className="md:hidden"
      >
        <nav className="flex flex-col gap-4 text-gray-700 text-base">
          <Link to="/" onClick={() => setDrawerVisible(false)}>
            Trang chủ
          </Link>
          <Link to="/category" onClick={() => setDrawerVisible(false)}>
            Ngành hàng
          </Link>
          <Link to="/voucher" onClick={() => setDrawerVisible(false)}>
            Mã giảm giá
          </Link>
          <Link to="/review" onClick={() => setDrawerVisible(false)}>
            Đánh giá
          </Link>
        </nav>
        <div className="mt-6 flex flex-col gap-4">
          <Input
            placeholder="Tìm kiếm voucher..."
            suffix={<SearchOutlined />}
          />
          <div className="flex gap-4">
            <Tooltip title="Đã lưu">
              <StarOutlined className="text-xl hover:text-green-600 cursor-pointer" />
            </Tooltip>
            <Tooltip title="Yêu thích">
              <HeartOutlined className="text-xl hover:text-green-600 cursor-pointer" />
            </Tooltip>
            {auth.isAuthenticated ? (
              <Tooltip title="Tài khoản">
                <Link to="/account" onClick={() => setDrawerVisible(false)}>
                  <img
                    src={auth.user.image || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                </Link>
              </Tooltip>
            ) : (
              <Tooltip title="Đăng nhập">
                <Link to="/login" onClick={() => setDrawerVisible(false)}>
                  <UserOutlined className="text-xl hover:text-green-600 cursor-pointer" />
                </Link>
              </Tooltip>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default AppHeader;
