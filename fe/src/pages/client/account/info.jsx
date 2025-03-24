import { Avatar, Button, Form, Input, Upload } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../components/context/auth.context";
import { updateUserApi, uploadApi } from "../../../utils/api";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const Info = () => {
  const { auth ,setAuth} = useContext(AuthContext);
  const [form] = Form.useForm();
  const [userAvatar, setUserAvatar] = useState("");
  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${userAvatar}`;
const navigate=useNavigate();

  useEffect(() => {
    form.setFieldsValue({
      name: auth.user.name,
      email: auth.user.email,
      phone: auth.user.phone,
      id: auth.user.id,
    });
    setUserAvatar(auth.user.image)
  }, [auth.user]);
  
 
  
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
    const { name,id,phone ,email} = values;
    const res = await updateUserApi(id,name,email,undefined,phone,userAvatar);
    if(res && res.data){
      message.success("Cập nhật thành công")
      localStorage.removeItem("access_token")
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
    }else{
      message.error(`Cập nhật thất bại`);
    }
  };
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <div className="flex justify-center items-center flex-col gap-4">
        <Avatar
          size={120}
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
        <hr />

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
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your email!",
            },
          ]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input your name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              required: true,
              message: "Please input your phone!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Info;
