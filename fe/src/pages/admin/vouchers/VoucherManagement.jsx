import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  DatePicker,
  Upload,
  Select,
  InputNumber,
  Image,
  Tag,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getAllVouchersApi,
  deleteVoucherApi,
  createVoucher,
  getVoucherCategory,
  getVoucherPlatform,
  uploadApi,
} from "../../../utils/api";
import dayjs from "dayjs";

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // create or edit
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchVouchers = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const filters = {};
      if (search) {
        filters.q = search;
      }

      const response = await getAllVouchersApi(pageSize, page, filters);
      const { data } = response.data;

      // Xử lý dữ liệu voucher
      const processedVouchers = (data?.vouchers || data || []).map(
        (voucher) => ({
          key: voucher._id,
          id: voucher._id,
          code: voucher.code,
          platform: voucher.platform,
          category: voucher.category,
          minimumOrder: voucher.minimumOrder,
          discountValue: voucher.discountValue,
          price: voucher.price,
          image: voucher.image,
          expirationDate: voucher.expirationDate,
          createdAt: voucher.createdAt,
          userId: voucher.userId || "Admin",
          sold: voucher.sold || false,
        })
      );

      setVouchers(processedVouchers);
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: data.total || processedVouchers.length,
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách voucher:", error);
      message.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getVoucherCategory();
      // Ensure categories is always an array
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error("Dữ liệu danh mục không phải mảng:", response?.data);
        setCategories([]); // Set to empty array as fallback
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      setCategories([]); // Set to empty array on error
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await getVoucherPlatform();
      // Ensure platforms is always an array
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setPlatforms(response.data.data);
      } else {
        console.error("Dữ liệu nền tảng không phải mảng:", response?.data);
        setPlatforms([]); // Set to empty array as fallback
      }
    } catch (error) {
      console.error("Lỗi khi tải nền tảng:", error);
      setPlatforms([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchVouchers(pagination.current, pagination.pageSize, searchValue);
    fetchCategories();
    fetchPlatforms();
  }, []);

  const handleTableChange = (pagination) => {
    fetchVouchers(pagination.current, pagination.pageSize, searchValue);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    fetchVouchers(1, pagination.pageSize, value);
  };

  const showCreateModal = () => {
    setModalType("create");
    setImageUrl(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (voucher) => {
    setModalType("edit");
    setEditingVoucherId(voucher.id);
    setImageUrl(voucher.image);
    form.setFieldsValue({
      code: voucher.code,
      platform: voucher.platform,
      category: voucher.category,
      minimumOrder: voucher.minimumOrder,
      discountValue: voucher.discountValue,
      price: voucher.price,
      expirationDate: voucher.expirationDate
        ? dayjs(voucher.expirationDate)
        : undefined,
    });
    setModalVisible(true);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể tải lên file hình ảnh!");
      setUploading(false);
      return false;
    }

    try {
      console.log("Uploading file:", file.name);
      const response = await uploadApi(file, "vouchers");

      if (response && response.data) {
        console.log("Upload response:", response.data);

        if (response.data.url) {
          // Store both the full URL and the path
          setImageUrl(response.data.path || response.data.url);
          message.success("Tải hình ảnh lên thành công");
        } else {
          console.error("Upload response missing URL:", response.data);
          message.error("Không thể tải hình ảnh lên: URL không được trả về");
        }
      } else {
        console.error("Invalid upload response:", response);
        message.error("Không thể tải hình ảnh lên: Phản hồi không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh lên:", error);
      message.error(
        "Không thể tải hình ảnh lên: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "create") {
        if (!imageUrl) {
          message.error("Vui lòng tải lên hình ảnh cho voucher");
          return;
        }

        await createVoucher(
          values.minimumOrder,
          values.platform,
          values.category,
          values.code,
          imageUrl,
          values.discountValue,
          values.expirationDate,
          values.price
        );

        message.success("Tạo voucher mới thành công");
      } else {
        // Cập nhật voucher (chưa có API)
        message.success("Cập nhật voucher thành công");
      }

      setModalVisible(false);
      fetchVouchers(pagination.current, pagination.pageSize, searchValue);
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      message.error("Không thể lưu voucher");
    }
  };

  const handleDelete = async (voucherId) => {
    try {
      await deleteVoucherApi(voucherId);
      message.success("Xóa voucher thành công");
      fetchVouchers(pagination.current, pagination.pageSize, searchValue);
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
      message.error("Không thể xóa voucher");
    }
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => {
        // Handle various image URL formats
        let imgSrc = image;
        if (image && !image.startsWith("http")) {
          // If the image path is relative, assume it's from our backend server
          const baseUrl =
            process.env.REACT_APP_API_URL || "http://localhost:8081";
          imgSrc = `${baseUrl}${image}`;
        }

        return (
          <Image
            src={imgSrc}
            alt="Voucher"
            width={80}
            height={80}
            style={{ objectFit: "contain" }}
            fallback="data:image/png;base64,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"
            onError={(e) => {
              console.error("Image failed to load:", imgSrc);
            }}
          />
        );
      },
      width: 100,
    },
    {
      title: "Mã voucher",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Nền tảng",
      dataIndex: "platform",
      key: "platform",
      filters: platforms.map((p) => ({ text: p, value: p })),
      onFilter: (value, record) => record.platform === value,
      width: 150,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: categories.map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
      width: 150,
    },
    {
      title: "Giảm giá",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value) => `${value}%`,
      sorter: (a, b) => a.discountValue - b.discountValue,
      width: 100,
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minimumOrder",
      key: "minimumOrder",
      render: (value) => `${value?.toLocaleString() || 0}đ`,
      sorter: (a, b) => a.minimumOrder - b.minimumOrder,
      width: 150,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString()}đ`,
      sorter: (a, b) => a.price - b.price,
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "sold",
      key: "sold",
      render: (sold) => (
        <Tag color={sold ? "red" : "green"}>{sold ? "Đã bán" : "Còn hàng"}</Tag>
      ),
      filters: [
        { text: "Còn hàng", value: false },
        { text: "Đã bán", value: true },
      ],
      onFilter: (value, record) => record.sold === value,
      width: 120,
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate),
      width: 130,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            disabled={record.sold}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa voucher này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            disabled={record.sold}
          >
            <Button danger icon={<DeleteOutlined />} disabled={record.sold} />
          </Popconfirm>
        </Space>
      ),
      width: 120,
      fixed: "right",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1>Quản lý voucher</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Input.Search
            placeholder="Tìm kiếm voucher..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Tạo mới
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={vouchers}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
        size="middle"
        bordered
        scroll={{ x: 1300 }}
      />
      <Modal
        title={modalType === "create" ? "Tạo voucher mới" : "Chỉnh sửa voucher"}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item
                name="code"
                label="Mã voucher"
                rules={[
                  { required: true, message: "Vui lòng nhập mã voucher" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="platform"
                label="Nền tảng"
                rules={[{ required: true, message: "Vui lòng chọn nền tảng" }]}
              >
                <Select
                  options={platforms.map((p) => ({ label: p, value: p }))}
                />
              </Form.Item>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  options={categories.map((c) => ({ label: c, value: c }))}
                />
              </Form.Item>
              <Form.Item
                name="discountValue"
                label="Giảm giá (%)"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị giảm giá" },
                ]}
              >
                <InputNumber min={1} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item
                name="minimumOrder"
                label="Đơn tối thiểu (đ)"
                rules={[
                  { required: true, message: "Vui lòng nhập đơn tối thiểu" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
              <Form.Item
                name="price"
                label="Giá bán (đ)"
                rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
              >
                <InputNumber
                  min={1000}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
              <Form.Item
                name="expirationDate"
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item
                label="Hình ảnh"
                rules={[
                  { required: true, message: "Vui lòng tải lên hình ảnh" },
                ]}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Upload
                    name="file"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={handleUpload}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Voucher"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          console.error(
                            "Preview image failed to load:",
                            imageUrl
                          );
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==";
                        }}
                      />
                    ) : (
                      <div>
                        {uploading ? <Spin /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    )}
                  </Upload>
                </div>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagement;
