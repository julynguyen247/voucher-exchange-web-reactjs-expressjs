import { Avatar, Button, Form, Input, Upload, Card, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../components/context/auth.context";
import { updateUserApi, uploadApi } from "../../../utils/api";

const Info = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [userAvatar, setUserAvatar] = useState("");
  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;

  useEffect(() => {
    form.setFieldsValue({
      name: auth.user.name,
      email: auth.user.email,
      phone: auth.user.phone,
      id: auth.user.id,
    });
    setUserAvatar(auth.user.image);
  }, [auth.user]);

  const handleUploadFile = async (options) => {
    const { onSuccess, onError, file } = options;
    try {
      const res = await uploadApi(file, "avatar");
      if (res && res.data) {
        const newAvatar = res.data.name;
        setUserAvatar(newAvatar);
        onSuccess?.("ok");
        message.success("Tải ảnh thành công!");
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      onError?.(err);
      message.error("Tải ảnh thất bại!");
    }
  };

  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    customRequest: handleUploadFile,
  };

  const onFinish = async (values) => {
    const { name, id, phone, email } = values;
    const res = await updateUserApi(
      id,
      name,
      email,
      undefined,
      phone,
      userAvatar
    );
    if (res && res.data) {
      message.success("Cập nhật thành công");
      setAuth((prevAuth) => ({
        ...prevAuth,
        user: {
          ...prevAuth.user,
          name,
          phone,
          image: userAvatar,
        },
      }));
    } else {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card
        className="w-full max-w-xl shadow-xl"
        title="Thông tin cá nhân"
        bordered={false}
      >
        <div className="flex flex-col items-center gap-6 mb-6">
          <Avatar
            size={120}
            src={urlAvatar}
            style={{
              border: "2px solid #1677ff",
              objectFit: "cover",
            }}
          />
          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />}>Thay ảnh đại diện</Button>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="id" hidden>
            <Input disabled />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Info;
