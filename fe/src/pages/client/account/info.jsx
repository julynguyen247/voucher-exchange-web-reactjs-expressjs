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
import { getBankListApi, updateUserApi, uploadApi } from "../../../utils/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const Info = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [userAvatar, setUserAvatar] = useState("");
  const [bankList, setBankList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/upload/${userAvatar}`;

  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
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
    setUploading(true);
    try {
      const res = await uploadApi(file, "avatar");
      if (res?.data?.path) {
        const fileName = res.data.path.split("/").pop();
        setUserAvatar(fileName);
        onSuccess?.("ok");
        message.success("Upload thành công!");
      } else {
        message.error("Upload thất bại!");
      }
    } catch (err) {
      message.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
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
    const updatedData = {
      id: values.id,
      name: values.name || auth.user.name,
      email: auth.user.email,
      phone: values.phone || auth.user.phone,
      bank: values.bank || auth.user.bank,
      accountNumber: values.accountNumber || auth.user.accountNumber,
      image: userAvatar || auth.user.image,
    };

    const hasChanged =
      updatedData.name !== auth.user.name ||
      updatedData.phone !== auth.user.phone ||
      updatedData.bank !== auth.user.bank ||
      updatedData.accountNumber !== auth.user.accountNumber ||
      updatedData.image !== auth.user.image;

    if (!hasChanged) {
      message.info("Không có thay đổi nào để cập nhật");
      return;
    }

    const res = await updateUserApi(
      updatedData.id,
      updatedData.name,
      updatedData.email,
      undefined,
      updatedData.phone,
      updatedData.image,
      updatedData.accountNumber,
      updatedData.bank
    );

    if (res && res.data) {
      message.success("Cập nhật thành công");
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          email: "",
          name: "",
          phone: "",
          id: "",
          image: "",
          role: "",
          bank: "",
          accountNumber: "",
        },
      });
      navigate("/");
    } else {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-xl shadow-xl" variant={false}>
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

        <p className="text-sm text-gray-500 italic mb-4 text-center">
          * Bạn chỉ cần điền những trường muốn thay đổi
        </p>

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

          <Form.Item label="Họ và tên" name="name">
            <Input placeholder="Không thay đổi thì để trống" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Không thay đổi thì để trống" />
          </Form.Item>

          <Form.Item label="Ngân hàng" name="bank">
            <Select placeholder="Không thay đổi thì để trống">
              {bankList.map((bank) => (
                <Option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Số tài khoản" name="accountNumber">
            <Input placeholder="Không thay đổi thì để trống" />
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
