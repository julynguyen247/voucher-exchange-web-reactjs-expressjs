import {
  Avatar,
  Button,
  Form,
  Input,
  Upload,
  Card,
  message,
  Select,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../components/context/auth.context";
import {
  getBankListApi,
  updateUserApi,
  uploadApi,
  logoutApi,
} from "../../../utils/api";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const Info = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [userAvatar, setUserAvatar] = useState("");
  const [bankList, setBankList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;
  const navigate = useNavigate();
  const handleLogout = async () => {
    const res = await logoutApi();
    if (res && res.data) {
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          email: "",
          name: "",
          phone: "",
          id: "",
          image: "",
          accountNumber: "",
          bank: "",
          role: "",
        },
      });
      navigate("/login");
    }
  };
  useEffect(() => {
    console.log(auth);
    form.setFieldsValue({
      name: auth.user.name,
      email: auth.user.email,
      phone: auth.user.phone,
      id: auth.user.id,
      bank: auth.user.bank,
      accountNumber: auth.user.accountNumber,
    });
    setUserAvatar(auth.user.image);
  }, [auth.user]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await getBankListApi();
        setBankList(res.data || []);
      } catch (err) {
        message.error("Lấy danh sách ngân hàng thất bại");
      }
    };

    fetchBanks();
  }, []);

  const handleUploadFile = async (options) => {
    const { onSuccess, file } = options;
    const res = await uploadApi(file, "avatar");

    if (res?.data?.path) {
      const fileName = res.data.path.split("/").pop();
      setUserAvatar(fileName);
      onSuccess?.("ok");

      message.success("Upload thành công!");
    } else {
      message.error("Upload thất bại!");
    }
  };
  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    customRequest: handleUploadFile,
    fileList,
  };

  const onFinish = async (values) => {
    const { name, id, phone, email, bank, accountNumber } = values;

    const res = await updateUserApi(
      id,
      name,
      email,
      undefined,
      phone,
      userAvatar,
      accountNumber,
      bank
    );
    console.log(res);
    if (res && res.data) {
      message.success("Cập nhật thành công");
      setAuth((prevAuth) => ({
        ...prevAuth,
        user: {
          ...prevAuth.user,
          name,
          phone,
          image: userAvatar,
          bank,
          accountNumber,
        },
      }));
      handleLogout();
    } else {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-xl shadow-xl " variant={false}>
        <div className="flex flex-col items-center gap-6 mb-6">
          <Avatar
            size={120}
            src={urlAvatar}
            icon={!userAvatar && !uploading ? <UploadOutlined /> : null}
            style={{
              border: "2px solid #1677ff",
              objectFit: "cover",
              backgroundColor: "#f0f0f0",
            }}
          />

          <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} loading={uploading}>
              {uploading ? "Đang tải..." : "Thay ảnh đại diện"}
            </Button>
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

          <Form.Item
            label="Ngân hàng"
            name="bank"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
          >
            <Select placeholder="Chọn ngân hàng">
              {bankList.map((bank) => (
                <Option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản!" }]}
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
