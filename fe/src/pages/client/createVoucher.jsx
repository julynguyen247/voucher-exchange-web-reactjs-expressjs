import React, { useState, useEffect } from "react";
import { Input, Form, Button, DatePicker, Select, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  createVoucher,
  getVoucherCategory,
  getVoucherPlatform,
} from "../../utils/api";
import { useNavigate } from "react-router-dom";

const CreateVoucherPage = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  const [voucherData, setVoucherData] = useState({
    title: "",
    platform: "",
    category: "",
    code: "",
    image: null,
    discountValue: "",
    expirationDate: null,
    price: "",
    status: "",
  });

  const [voucherPlatform, setVoucherPlatform] = useState([]);
  const [voucherCategory, setVoucherCategory] = useState([]);
  const [fileList, setFileList] = useState([]);

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setVoucherData({
        ...voucherData,
        image: newFileList[0].originFileObj,
      });
    }
  };

  const handleCreateVoucher = async (values) => {
    const formData = new FormData();
    formData.append("minimumOrder", values.minimumOrder);
    formData.append("platform", values.platform);
    formData.append("category", values.category);
    formData.append("code", values.code);
    formData.append("image", voucherData.image);
    formData.append("discountValue", values.discountValue);
    formData.append(
      "expirationDate",
      values.expirationDate.format("YYYY-MM-DD")
    );
    formData.append("price", values.price);
    formData.append("status", "available");

    try {
      const response = await createVoucher(formData);
      console.log("Voucher created successfully:", response.data);
      navigate("/voucher");
    } catch (error) {
      console.error("Error creating voucher:", error);
    }
  };

  useEffect(() => {
    const fetchPlatform = async () => {
      const res = await getVoucherPlatform();
      if (res && res.data) {
        setVoucherPlatform(
          res.data.data.map((item) => ({
            value: item,
            label: item,
          }))
        );
      }
    };

    const fetchCategory = async () => {
      const res = await getVoucherCategory();
      if (res && res.data) {
        setVoucherCategory(
          res.data.data.map((item) => ({
            value: item,
            label: item,
          }))
        );
      }
    };

    fetchCategory();
    fetchPlatform();
  }, []);

  return (
    <div>
      <div className="flex justify-center items-center bg-cyan-600 h-[1050px] ">
        <div className="w-[80vw] sm:w-1/2 md:w-1/2 lg:w-2/4 xl:w-1/3 bg-white p-2 rounded-lg shadow-xl ">
          <div className="font-bold text-4xl mb-6 text-[#198754] text-center">
            Add New Voucher
          </div>
          <Form
            name="add-voucher"
            onFinish={handleCreateVoucher}
            initialValues={voucherData}
            autoComplete="off"
            layout="vertical"
            className="w-full h-full"
          >
            <Form.Item
              label="MinimumOrder"
              name="minimumOrder"
              labelCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please enter a minimumOrder!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Platform"
              name="platform"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: "Please select platform!" }]}
            >
              <Select options={voucherPlatform} />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: "Please select category!" }]}
            >
              <Select options={voucherCategory} />
            </Form.Item>

            <Form.Item
              label="Code"
              name="code"
              labelCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please enter the voucher code!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Image"
              name="image"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: "Please upload an image!" }]}
            >
              <Upload
                maxCount={1}
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Discount Value"
              name="discountValue"
              labelCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please enter the discount value!" },
              ]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="Expiration Date"
              name="expirationDate"
              labelCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please select expiration date!" },
              ]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item
              label="Price"
              name="price"
              labelCol={{ span: 24 }}
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
    </div>
  );
};

export default CreateVoucherPage;
