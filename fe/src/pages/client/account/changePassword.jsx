import React, { useContext, useEffect } from "react";
import { Button, Form, Input, message, Card } from "antd";
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
      message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: { email: "", name: "", phone: "", id: "", image: "" },
      });
      navigate("/");
    } else {
      message.error("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card
        className="w-full max-w-xl shadow-xl"
        title="Đổi mật khẩu"
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              {
                pattern:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                message: "Phải có ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu"
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
            <Button type="primary" htmlType="submit" block>
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
