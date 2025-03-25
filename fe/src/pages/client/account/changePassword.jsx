import { Button, Form, Input, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { updateUserApi } from "../../../utils/api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ id: auth.user.id });
  }, [auth.user]);

  const onFinish = async (values) => {
    const { password, id } = values;
    const res = await updateUserApi(
      id,
      undefined,
      undefined,
      password,
      undefined,
      undefined
    );

    if (res) {
      message.success("Updated Successfully");
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: { email: "", name: "", phone: "", id: "", image: "" },
      });
      navigate("/");
    } else {
      message.error("Update failed");
    }
  };

  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
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
          label="Confirm Password"
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
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;
