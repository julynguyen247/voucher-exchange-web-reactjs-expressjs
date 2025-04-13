import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const LoginPage = () => {
  const navigate = useNavigate();

  // Handle successful Google login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8081/api/v1/auth/google-login", {
        credential: credentialResponse.credential,
      });

      if (res.data && res.data.EC === 0) {
        message.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        message.error(res.data.EM || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối hệ thống:", error);
      message.error("Lỗi kết nối hệ thống!");
    }
  };

  useEffect(() => {
    // Lấy thông tin người dùng từ URL sau khi redirect
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const email = params.get("email");

    if (name && email) {
      // Lưu thông tin người dùng vào localStorage hoặc context
      localStorage.setItem("user", JSON.stringify({ name, email }));
      console.log("Người dùng đã đăng nhập:", { name, email });

      // Điều hướng đến trang chính
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");

    if (reason === "no-email") {
      message.error("Tài khoản Google của bạn không có email. Vui lòng sử dụng tài khoản khác.");
    }
  }, []);

  return (
    <div style={{ marginTop: "100px", textAlign: "center" }}>
      <h2>Đăng nhập bằng Google</h2>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default LoginPage;
