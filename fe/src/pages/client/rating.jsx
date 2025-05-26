import React, { useEffect, useState, useCallback } from "react";
import ratingApi from "../../utils/api.js";

import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Avatar,
  Tooltip,
  Drawer,
  Descriptions,
  Button,
  message,
} from "antd";
import { CrownOutlined, UserOutlined } from "@ant-design/icons";
import ReactStars from "react-rating-stars-component";

const Rating = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  // rating ẩn danh
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const fetchUsers = useCallback(async (page = 1, pageSize = 20) => {
    try {
      const res = await ratingApi.getUsers(page, pageSize);
      setUserData(res.data.users);
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit,
        total: res.data.pagination.total
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng: ", error);
      message.error("Không thể tải danh sách người dùng!");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRatingChange = async (newRating, record) => {
    const token = localStorage.getItem("access_token");
    
    if (!token && !allowAnonymous) {
      message.warning("Bạn cần đăng nhập để đánh giá!");
      return;
    }

    try {
      await ratingApi.rateUser(record._id, newRating);
      await fetchUsers();
      message.success("Đánh giá thành công!");
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi khi đánh giá!");
    }
  };

  const sortedData = [...userData].sort((a, b) => {
    if (b.ratingAvg !== a.ratingAvg) {
      return b.ratingAvg - a.ratingAvg;
    }
    return b.ratingCount - a.ratingCount;
  });

  const columns = [
    {
      title: "Hạng",
      key: "rank",
      render: (_, record) => {
        const rank = sortedData.findIndex(u => u._id === record._id) + 1;
        const color =
          rank === 1
            ? "text-yellow-500"
            : rank === 2
            ? "text-gray-500"
            : rank === 3
            ? "text-orange-400"
            : "text-blue-600";
        return <span className={`font-bold ${color}`}>{rank}</span>;
      },
    },
    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} />
          <Button
            type="link"
            onClick={() => {
              setSelectedUser(record);
              setOpen(true);
            }}
          >
            {text}
            {index === 0 && (
              <span className="ml-1 text-yellow-500 font-bold">👑</span>
            )}
          </Button>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Đánh giá",
      dataIndex: "ratingAvg",
      key: "ratingAvg",
      sorter: (a, b) => b.ratingAvg - a.ratingAvg,
      render: (ratingAvg, record) => (
        <div className="flex items-center gap-1">
          <ReactStars
            count={5}
            value={ratingAvg}
            size={20}
            edit={true}
            isHalf={true}
            activeColor="#fadb14"
            onChange={(newRating) => handleRatingChange(newRating, record)}
          />
          <Tooltip title={`${record.ratingCount} lượt đánh giá`}>
            <span className="text-sm text-gray-500">
              ({record.ratingCount})
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  const topUser = sortedData[0];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        🏆 Đánh giá người dùng
      </h1>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card
            style={{ borderColor: "#91d5ff", backgroundColor: "#e6f7ff" }}
            headStyle={{ color: "#1890ff" }}
          >
            <Statistic
              title="Tổng số người dùng"
              value={userData.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            style={{ borderColor: "#ffe58f", backgroundColor: "#fffbe6" }}
            headStyle={{ color: "#faad14" }}
          >
            <Statistic
              title="Top 1"
              value={topUser?.name || "Chưa có"}
              prefix={<CrownOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={sortedData}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchUsers(page, pageSize)
          }}
          rowClassName={(_, index) =>
            index === 0
              ? "bg-yellow-50"
              : index === 1
              ? "bg-gray-50"
              : index === 2
              ? "bg-orange-50"
              : ""
          }
        />
      </Card>

      <Drawer
        title="Thông tin người dùng"
        placement="right"
        width={360}
        onClose={() => setOpen(false)}
        open={open}
      >
        {selectedUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ tên">
              {selectedUser.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="ID">{selectedUser._id}</Descriptions.Item>
            <Descriptions.Item label="Số lượt đánh giá">
              {selectedUser.ratingCount}
            </Descriptions.Item>
            <Descriptions.Item label="Điểm trung bình">
              {selectedUser.ratingAvg}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default Rating;
