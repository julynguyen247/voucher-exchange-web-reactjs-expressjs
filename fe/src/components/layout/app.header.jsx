import React, { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../utils/api";
import { Input, Tooltip, Drawer, Button, Dropdown } from "antd";
import { HeartOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";
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
      setDrawerVisible(false);
      setSearchValue("");
    }
  };

  const menu = {
    items: [
      {
        key: "1",
        label: (
          <Link
            to="/account"
            style={{
              textDecoration: "none",
              fontSize: "16px",
              padding: "8px 12px",
              display: "block",
              fontWeight: 600,
              color: "#2563EB",
            }}
            onClick={() => setDrawerVisible(false)}
          >
            Chỉnh sửa thông tin
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <Link
            to="/create-voucher"
            style={{
              textDecoration: "none",
              fontSize: "16px",
              padding: "8px 12px",
              display: "block",
              fontWeight: 600,
              color: "#2563EB",
            }}
            onClick={() => setDrawerVisible(false)}
          >
            Tạo voucher
          </Link>
        ),
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
            src="/logo-black.png"
            alt="logo"
            className="w-30 h-10 object-cover  bg-white"
          />
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
            to="/profile"
            className="hover:text-green-600"
            style={{ textDecoration: "none" }}
          >
            Trang cá nhân
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
        <div className="flex flex-col gap-4">
          <Input.Search
            placeholder="Tìm kiếm voucher..."
            enterButton
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
          <nav className="flex flex-col gap-4 text-gray-700 text-base">
            <Link
              to="/"
              onClick={() => setDrawerVisible(false)}
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Trang chủ
            </Link>
            <Link
              to="/rating"
              onClick={() => setDrawerVisible(false)}
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Đánh giá
            </Link>
            <Link
              to="/voucher"
              onClick={() => setDrawerVisible(false)}
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Mã giảm giá
            </Link>
            <Link
              to="/profile"
              onClick={() => setDrawerVisible(false)}
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Trang cá nhân
            </Link>
            <Link
              to="/transaction-history"
              onClick={() => setDrawerVisible(false)}
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Lịch sử giao dịch
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            {auth.isAuthenticated ? (
              <Dropdown menu={menu} placement="bottomRight">
                <span>
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-15 h-15 rounded-full object-cover border cursor-pointer"
                  />
                </span>
              </Dropdown>
            ) : (
              <Tooltip title="Đăng nhập">
                <Link to="/login" onClick={() => setDrawerVisible(false)}>
                  <UserOutlined className="text-2xl hover:text-green-600 cursor-pointer" />
                </Link>
              </Tooltip>
            )}
            <Tooltip title="Yêu thích">
              <HeartOutlined
                className="text-2xl hover:text-green-600 cursor-pointer"
                onClick={() => {
                  setDrawerVisible(false);
                  navigate("/favorites");
                }}
              />
            </Tooltip>
          </div>
          {auth.isAuthenticated && (
            <div className="mt-6">
              <Button danger block onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
};

export default AppHeader;
