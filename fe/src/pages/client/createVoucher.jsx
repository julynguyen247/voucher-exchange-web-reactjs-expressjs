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

const CreateVoucherPage = () => {
  const navigate = useNavigate();
  const [voucherPlatform, setVoucherPlatform] = useState([]);
  const [voucherCategory, setVoucherCategory] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchPlatform = async () => {
      const res = await getVoucherPlatform();
      if (res && res.data) {
        setVoucherPlatform(
          res.data.data.map((item) => ({ value: item, label: item }))
        );
      }
    };

    const fetchCategory = async () => {
      const res = await getVoucherCategory();
      if (res && res.data) {
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
    if (res && res.data) {
      setImageUrl(res.data.name);
      setFileList([file]);
      if (onSuccess) onSuccess("ok");
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
      imageUrl,
      code,
      discountValue,
      expirationDate,
      price
    );
    if (res && res.data) {
      message.success("Thêm voucher thành công!");
      navigate("/voucher");
    } else {
      message.error("Thêm voucher thất bại!");
    }
  };

  return (
    <div className="flex justify-center items-center bg-cyan-600 h-[1050px]">
      <div className="w-[80vw] sm:w-1/2 md:w-1/2 lg:w-2/4 xl:w-1/3 bg-white p-2 rounded-lg shadow-xl">
        <div className="font-bold text-4xl mb-6 text-[#198754] text-center">
          Add New Voucher
        </div>
        
        <Form
          name="add-voucher"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Minimum Order"
            name="minimumOrder"
            rules={[
              { required: true, message: "Please enter a minimum order!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Platform"
            name="platform"
            rules={[{ required: true, message: "Please select platform!" }]}
          >
            <Select options={voucherPlatform} />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select options={voucherCategory} />
          </Form.Item>
          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter the voucher code!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Image"
            name="image"
            rules={[{ required: true, message: "Please upload an image!" }]}
          >
            <Upload {...propsUpload}>
              {imageUrl ? (
                <img
                  src={`${
                    import.meta.env.VITE_BACKEND_URL
                  }/images/upload/${imageUrl}`}
                  alt="voucher"
                  style={{ width: "30%", borderRadius: "5px" }}
                />
              ) : (
                <Button icon={<PlusOutlined />}>Upload</Button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Discount Value"
            name="discountValue"
            rules={[
              { required: true, message: "Please enter the discount value!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Expiration Date"
            name="expirationDate"
            rules={[
              { required: true, message: "Please select expiration date!" },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter the price!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-4 bg-[#198754]"
            >
              Add Voucher
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateVoucherPage;
