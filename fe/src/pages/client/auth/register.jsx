import React, { useState } from "react";
import { registerApi, uploadApi } from "../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Divider,
  message,
  Avatar,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const RegisterPage = () => {
  const [userAvatar, setUserAvatar] = useState("");
  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;
  const navigate = useNavigate();

  const handleUploadFile = async (options) => {
    const { onSuccess } = options;
    const file = options.file;
    const res = await uploadApi(file, "avatar");

    if (res && res.data) {
      const newAvatar = res.data.name;
      setUserAvatar(newAvatar);
      if (onSuccess) onSuccess("ok");
    } else {
      message.error(res.message);
    }
  };

  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    customRequest: handleUploadFile,
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`Upload file thành công`);
      } else if (info.file.status === "error") {
        message.error(`Upload file thất bại`);
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
    if (res && res.data) {
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
    <div className="flex justify-center items-center h-[100vh] w-full flex-col">
      <div className="font-bold text-4xl mb-6 text-[#198754] text-center">
        Đăng ký
      </div>
      <div className="bg-gray-300 p-8 sm:p-10 w-[70vw] rounded-lg shadow-lg sm:w-[30vw] md:w-[25vw] lg:w-[400px] h-auto sm:h-[60vh] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col mt-3 gap-2">
          <Avatar
            size={100}
            src={urlAvatar}
            style={{
              border: "1px solid black",
              objectFit: "cover",
            }}
          />
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
          </Upload>
        </div>
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
            labelCol={{ span: 24 }}
            rules={[
              { type: "email", required: true, message: "Vui lòng nhập email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Họ và Tên"
            name="name"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input />
          </Form.Item>

      
          <Form.Item
            label="Mật khẩu"
            name="password"
            labelCol={{ span: 24 }}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                message:
                  "Mật khẩu phải chứa ít nhất một chữ hoa, một số và một ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

        
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            labelCol={{ span: 24 }}
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
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-4 bg-[#198754]"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <Divider>Hoặc</Divider>
          <p className="text-center">
            Đã có tài khoản?
            <Link to="/login" style={{ textDecoration: "none", marginLeft: 5 }}>
              Đăng nhập
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
