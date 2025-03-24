import { Avatar, Button, Form, Input, Upload } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../components/context/auth.context";
import { uploadApi } from "../../../utils/api";
import { message } from "antd";


const Info = () => {
  const { auth } = useContext(AuthContext);
  const [form] = Form.useForm();

  useEffect(()=>{
    form.setFieldsValue({
      name:auth.user.name,
      email:auth.user.email
    })
  },[auth.user]) 

  const [userAvatar, setUserAvatar] = useState("avt.png");
  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;
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

  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <div className="flex justify-center items-center flex-col gap-4">
        <Avatar
          size={120}
          src={userAvatar ? urlAvatar : undefined}
          style={{
            border:"1px solid black",
            objectFit:"cover"
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
      >
        <hr />
       
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input disabled/>
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
