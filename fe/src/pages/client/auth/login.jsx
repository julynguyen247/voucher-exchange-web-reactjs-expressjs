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
      message.success("Login successfully");
      setAuth({
        isAuthenticated: true,
        user: res.data.user || {
          email: res.data.user.email ?? "",
          name: res.data.user.name ?? "",
          role: res.data.user.role ?? "",
          id: res.data.user.id ?? "",
          phone: res.data.user.phone ?? "",
          image: res.data.user.image ?? "",
        },
      });
      navigate("/");
    } else {
      message.error("Error email/password");
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
          user: res.data.user,
        });
        message.success("Đăng nhập bằng Google thành công");
        navigate("/");
      } else {
        message.error("Đăng nhập Google thất bại");
      }
    } catch (err) {
      console.error("Google login error:", err);
      message.error("Lỗi hệ thống khi login Google");
    }
  };

  return (
    <div className="flex justify-center items-center w-full px-4 flex-col h-[70vh]">
      <div className="font-bold text-4xl mb-6 text-[##3685f9] text-center">
        Đăng nhập
      </div>
      <br />
      <div className="bg-gray-300 p-8 sm:p-10 w-[70vw] rounded-lg shadow-lg sm:w-[40vw] md:w-[25vw] lg:w-[400px] h-auto sm:h-[60vh] flex justify-center items-center">
        <Form
          name="basic"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="w-3xs mt-4"
        >
          <Form.Item
            label="Email"
            name="email"
            labelCol={{
              span: 24,
            }}
            rules={[
              {
                type: "email",
                required: true,
                message: "Vui lòng nhập email!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            labelCol={{
              span: 24,
            }}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-4 bg-[##3685f9]"
              style={{ backgroundColor: "##3685f9" }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
          <Divider>Or</Divider>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                message.error("Đăng nhập bằng Google thất bại");
              }}
            />
          </div>
          <p className="text text-normal" style={{ textAlign: "center" }}>
            Chưa có tài khoản?
            <span>
              <Link to="/register" style={{ textDecoration: "none" }}>
                {" "}
                Đăng Ký{" "}
              </Link>
            </span>
          </p>
          <br />
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
