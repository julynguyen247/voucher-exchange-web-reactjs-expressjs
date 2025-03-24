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
    const res = await updateUserApi(id, undefined, undefined, password, undefined, undefined);

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
            { required: true, message: "Please enter your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number!",
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
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
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
