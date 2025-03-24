import React, { useContext, useState } from "react";
import { registerApi } from "../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Divider, App } from "antd";

const RegisterPage = () => {
  const [pass, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const onFinish = async (values) => {
    if (pass !== confirmPassword) {
      notification.error({
        message: "Mật khẩu không khớp!",
      });
    } else {
      const { name, email, password } = values;
      const res = await registerApi(name, email, password);
      if (res && res.data) {
        if (res.data.result === null) {
          notification.error({
            message: "Email đã tồn tại!",
          });
        } else {
          notification.success({
            message: "Register successfully",
          });
          navigate("/login");
        }
      } else {
        notification.error({
          message: "Error email/password",
        });
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] w-full flex-col">
      <div className="font-bold text-4xl mb-6 text-[#198754] text-center">
        Đăng ký
      </div>
      <br />
      <div className="bg-gray-300 p-8 sm:p-10 w-[70vw] rounded-lg shadow-lg sm:w-[30vw] md:w-[25vw] lg:w-[400px] h-auto sm:h-[60vh] flex justify-center items-center">
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
            label="Họ và Tên"
            name="name"
            labelCol={{
              span: 24,
            }}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ và tên!",
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
            <Input.Password onChange={(e) => setPass(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm-password"
            labelCol={{
              span: 24,
            }}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!!",
              },
            ]}
          >
            <Input.Password
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-4 bg-[#198754]"
              style={{ backgroundColor: "#198754" }}
            >
              Đăng ký
            </Button>
          </Form.Item>
          <Divider>Or</Divider>
          <p className="text text-normal" style={{ textAlign: "center" }}>
            Đã có tài khoản?
            <span>
              <Link to="/login" style={{ textDecoration: "none" }}>
                {" "}
                Đăng nhập{" "}
              </Link>
            </span>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
