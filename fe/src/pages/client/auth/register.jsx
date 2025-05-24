import React, { useState } from "react";
import { registerApi, uploadApi } from "../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Divider, message, Avatar, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const RegisterPage = () => {
  const [userAvatar, setUserAvatar] = useState("");
  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;
  const navigate = useNavigate();

  const handleUploadFile = async (options) => {
    const { onSuccess, file } = options;
    const res = await uploadApi(file, "avatar");

    if (res?.data) {
      setUserAvatar(res.data.name);
      onSuccess?.("ok");
    } else {
      message.error(res.message || "Lỗi khi upload!");
    }
  };

  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    customRequest: handleUploadFile,
    onChange(info) {
      if (info.file.status === "done") {
        message.success("Upload ảnh thành công");
      } else if (info.file.status === "error") {
        message.error("Upload ảnh thất bại");
      }
    },
  };

  const onFinish = async (values) => {
    const { name, email, password, phone, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    const res = await registerApi(name, email, password, phone, userAvatar);
    if (res?.data) {
      if (res.data.result === null) {
        message.error("Email đã tồn tại!");
      } else {
        message.success("Đăng ký thành công!");
        navigate("/login");
      }
    } else {
      message.error("Lỗi khi đăng ký, vui lòng thử lại!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="w-full max-w-md bg-white p-4 rounded-2xl shadow-lg mt-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Đăng ký
        </h1>

        <div className="flex justify-center flex-col items-center mb-4">
          <Avatar
            size={100}
            src={userAvatar ? urlAvatar : undefined}
            style={{ border: "1px solid #ccc", objectFit: "cover" }}
          />
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} className="mt-2" type="default">
              Tải ảnh đại diện
            </Button>
          </Upload>
        </div>

        <Form
          layout="vertical"
          name="register-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Họ và Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: "email", required: true, message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
              {
                pattern:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                message: "Phải có chữ in hoa, số và ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <Divider>Hoặc</Divider>

          <p className="text-center text-sm">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
