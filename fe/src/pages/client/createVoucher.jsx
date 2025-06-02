import React, { useState, useEffect } from "react";
import { Input, Form, Button, DatePicker, Select, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  createVoucher,
  getVoucherCategory,
  getVoucherPlatform,
  uploadApi,
} from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/context/auth.context";
import { useContext } from "react";
const CreateVoucherPage = () => {
  const navigate = useNavigate();
  const [voucherPlatform, setVoucherPlatform] = useState([]);
  const [voucherCategory, setVoucherCategory] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const { auth, setAuth } = useContext(AuthContext);
  useEffect(() => {
    const fetchPlatform = async () => {
      const res = await getVoucherPlatform();
      if (res?.data) {
        setVoucherPlatform(
          res.data.data.map((item) => ({ value: item, label: item }))
        );
      }
    };

    const fetchCategory = async () => {
      const res = await getVoucherCategory();
      if (res?.data) {
        setVoucherCategory(
          res.data.data.map((item) => ({ value: item, label: item }))
        );
      }
    };

    fetchCategory();
    fetchPlatform();
  }, []);

  const handleUploadFile = async (options) => {
    const { onSuccess, file } = options;
    const res = await uploadApi(file, "voucher");

    if (res?.data?.path) {
      const fileName = res.data.path.split("/").pop();
      setImageUrl(fileName);
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
    const {
      minimumOrder,
      platform,
      category,
      code,
      discountValue,
      expirationDate,
      price,
    } = values;

    const res = await createVoucher(
      minimumOrder,
      platform,
      category,
      code,
      imageUrl,
      discountValue,
      expirationDate,
      price,
      auth.user.email
    );

    if (res?.data) {
      message.success("Thêm voucher thành công!");
      navigate("/voucher");
    } else {
      message.error("Thêm voucher thất bại!");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-green-100 to-cyan-100 min-h-screen py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
          Thêm Voucher Mới
        </h1>

        <Form layout="vertical" name="create-voucher" onFinish={onFinish}>
          <Form.Item
            label="Giá trị đơn tối thiểu"
            name="minimumOrder"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị tối thiểu!" },
            ]}
          >
            <Input placeholder="VD: 500000" />
          </Form.Item>

          <Form.Item
            label="Nền tảng"
            name="platform"
            rules={[{ required: true, message: "Chọn nền tảng!" }]}
          >
            <Select options={voucherPlatform} placeholder="Chọn nền tảng" />
          </Form.Item>

          <Form.Item
            label="Ngành hàng"
            name="category"
            rules={[{ required: true, message: "Chọn ngành hàng!" }]}
          >
            <Select options={voucherCategory} placeholder="Chọn ngành hàng" />
          </Form.Item>

          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: "Nhập mã giảm giá!" }]}
          >
            <Input placeholder="VD: GIAM50K" />
          </Form.Item>

          <Form.Item
            label="Ảnh đại diện"
            name="image"
            rules={[{ required: true, message: "Hãy tải ảnh!" }]}
          >
            <Upload {...propsUpload}>
              {imageUrl ? (
                <img
                  src={`${
                    import.meta.env.VITE_BACKEND_URL
                  }/images/upload/${imageUrl}`}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              ) : (
                <Button icon={<PlusOutlined />}>Tải ảnh</Button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="discountValue"
            rules={[{ required: true, message: "Nhập số tiền giảm!" }]}
          >
            <Input type="number" placeholder="VD: 50000" />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            name="expirationDate"
            rules={[{ required: true, message: "Chọn ngày hết hạn!" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            label="Giá trị voucher"
            name="price"
            rules={[{ required: true, message: "Nhập giá voucher!" }]}
          >
            <Input type="number" placeholder="VD: 10000" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Tạo Voucher
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateVoucherPage;
