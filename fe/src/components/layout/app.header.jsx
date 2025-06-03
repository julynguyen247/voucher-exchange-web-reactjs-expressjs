import React, { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../utils/api";
import { Input, Tooltip, Drawer, Button, Dropdown } from "antd";
import {
  HeartOutlined,
  StarOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const AppHeader = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const userAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${
    auth.user.image
  }`;

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res && res.data) {
      localStorage.removeItem("access_token");
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
      navigate("/login");
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/voucher?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const menu = {
    items: [
      {
        key: "1",
        label: (
          <Link to="/account" style={{ textDecoration: "none" }}>
            Chỉnh sửa thông tin
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <Link to="/create-voucher" style={{ textDecoration: "none" }}>
            Tạo voucher
          </Link>
        ),
      },
      {
        key: "3",
        label: <span onClick={handleLogout}>Đăng xuất</span>,
      },
    ],
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
          <span className="text-xl font-bold text-blue-400">VOUCHERS</span>
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
            to="/ranking"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Xếp hạng
          </Link>
          <Link
            to="/rating"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Đánh giá
          </Link>
          <Link
            to="/voucher"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Mã giảm giá
          </Link>
          <Link
            to="/transaction-history"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Lịch sử giao dịch
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Input.Search
            placeholder="Tìm kiếm voucher..."
            enterButton
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            className="w-52"
          />

          <Tooltip title="Yêu thích">
            <HeartOutlined
              className="text-xl hover:text-green-600 cursor-pointer"
              onClick={() => navigate("/favorites")}
            />
          </Tooltip>

          {auth.isAuthenticated ? (
            <Dropdown menu={menu} placement="bottomRight">
              <img
                src={userAvatar}
                alt="avatar"
                className="w-10 h-10 rounded-full border cursor-pointer object-cover"
              />
            </Dropdown>
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
        open={drawerVisible}
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
          <Input.Search
            placeholder="Tìm kiếm voucher..."
            enterButton
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
          <div className="flex gap-4 items-center">
            <Tooltip title="Đã lưu">
              <StarOutlined className="text-xl hover:text-green-600 cursor-pointer" />
            </Tooltip>
            <Tooltip title="Yêu thích">
              <HeartOutlined
                className="text-xl hover:text-green-600 cursor-pointer"
                onClick={() => {
                  setDrawerVisible(false);
                  navigate("/favorites");
                }}
              />
            </Tooltip>
            {auth.isAuthenticated ? (
              <Dropdown menu={menu} placement="bottomRight">
                <span>
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                  />
                </span>
              </Dropdown>
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
