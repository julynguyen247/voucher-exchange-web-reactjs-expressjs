import React, { useContext, useState } from "react";
import { loginApi } from "../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Divider, message } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { AuthContext } from "../../../components/context/auth.context";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [isSubmit, setIsSubmit] = useState(false);

  const onFinish = async (values) => {
    setIsSubmit(true);
    const { email, password } = values;
    const res = await loginApi(email, password);
    if (res && res.data.EC === 0) {
      localStorage.setItem("access_token", res.data.access_token);
      message.success("Đăng nhập thành công");
      setAuth({
        isAuthenticated: true,
        user: res.data.user || {
          email: res.data.user.email ?? "",
          name: res.data.user.name ?? "",
          role: res.data.user.role ?? "",
          id: res.data.user.id ?? "",
          phone: res.data.user.phone ?? "",
          image: res.data.user.image ?? "",
          bank: res.data.user.bank ?? "",
          accountNumber: res.data.user.accountNumber ?? "",
        },
      });
      navigate("/");
    } else {
      message.error("Email hoặc mật khẩu không chính xác");
    }
    setIsSubmit(false);
  };

  const handleGoogleSuccess = async (response) => {
    const credential = response.credential;
    try {
      const res = await axios.post(
        "http://localhost:8081/api/v1/auth/google-login",
        { credential }
      );

      if (res.data && res.data.EC === 0) {
        localStorage.setItem("access_token", res.data.access_token);
        setAuth({
          isAuthenticated: true,
          user: {
            email: res.data.user.email || "",
            name: res.data.user.name || "",
            id: res.data.user._id || "",
            phone: res.data.user.phone || "",
            image: res.data.user.image || "",
            role: res.data.user.role || "",
          },
        });
        message.success("Đăng nhập bằng Google thành công");
        navigate("/");
      } else {
        message.error("Đăng nhập Google thất bại");
      }
    } catch (err) {
      console.error("Google login error:", err);
      message.error("Lỗi hệ thống khi đăng nhập Google");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Đăng nhập
        </h1>

        <Form
          name="login-form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Vui lòng nhập email hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              loading={isSubmit}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider>Hoặc</Divider>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => message.error("Đăng nhập bằng Google thất bại")}
            />
          </div>

          <p className="text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
