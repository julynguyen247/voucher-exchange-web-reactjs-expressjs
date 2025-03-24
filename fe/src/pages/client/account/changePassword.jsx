import { Button, Form, Input, message, notification } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { updateUserApi } from "../../../utils/api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate=useNavigate()
  const [pass, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { auth,setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      id: auth.user.id,
    });
  }, [auth.user]);
  const onFinish = async (values) => {
    if (pass !== confirmPassword) {
      message.error({
        content: "Mật khẩu không khớp!",
        style: {
          marginRight: "65px",
        },
      });
    } else {
      const { password, id } = values;
      const res = await updateUserApi(id,undefined,undefined, password,undefined,undefined);
      if (res) {
        message.success({
          content: "Updated Successfully",
        });
        localStorage.removeItem("access_token");
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: "",
            phone:"",
            id:"",
            image:"",
          },
        })
        navigate("/")

      } else {
        message.error({
          content: "Update failed",
        });
      }
    }
  };
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <Form
        form={form}
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item
          label="ID"
          name="id"
          rules={[
            {
              required: true,
              message: "Please input your id!",
            },
          ]}
          hidden
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password onChange={(e) => setPass(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="c-password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Item>

        <Form.Item label={null} style={{marginRight:"20px"}}>
          <Button type="primary" htmlType="submit" >
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;
