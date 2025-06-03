import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  getVoucherCategory,
  getVoucherPlatform,
  updateVoucherApi,
} from "../../../utils/api";
import { useState } from "react";

const { Option } = Select;

const VoucherUpdate = ({ open, onCancel, voucher, onUpdated }) => {
  const [form] = Form.useForm();
  const [platformOptions, setPlatformOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const platformRes = await getVoucherPlatform();
      const categoryRes = await getVoucherCategory();

      if (platformRes?.data?.data) {
        setPlatformOptions(
          platformRes.data.data.map((item) => ({ label: item, value: item }))
        );
      }

      if (categoryRes?.data?.data) {
        setCategoryOptions(
          categoryRes.data.data.map((item) => ({ label: item, value: item }))
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (voucher) {
      form.setFieldsValue({
        ...voucher,
        expirationDate: dayjs(voucher.expirationDate),
      });
    }
  }, [voucher, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        expirationDate: values.expirationDate.toISOString(),
      };

      const res = await updateVoucherApi(voucher._id, payload);
      console.log(res);
      if (res.data.EC === 0) {
        message.success("Cập nhật voucher thành công");
        onUpdated();
        onCancel();
      } else {
        message.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi cập nhật voucher");
    }
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa voucher"
      onCancel={onCancel}
      okText="Cập nhật"
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="discountValue"
          label="Giá trị giảm (đ)"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item name="minimumOrder" label="Giá trị tối thiểu (đ)">
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item name="price" label="Giá (đ)">
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          name="expirationDate"
          label="Hạn sử dụng"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="platform"
          label="Nền tảng"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn nền tảng" options={platformOptions} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn danh mục" options={categoryOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VoucherUpdate;
