import React, { useEffect, useState } from "react";
import { Table, Card, Statistic, Row, Col, Avatar, Tooltip } from "antd";
import { CrownOutlined, UserOutlined } from "@ant-design/icons";
import ReactStars from "react-rating-stars-component";

const Ranking = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    // Gọi API thật ở đây
    setUserData([
      {
        id: "1",
        name: "Nguyễn Văn A",
        email: "a@gmail.com",
        ratingAvg: 4.8,
        ratingCount: 12,
      },
      {
        id: "2",
        name: "Trần Thị B",
        email: "b@gmail.com",
        ratingAvg: 4.5,
        ratingCount: 20,
      },
      {
        id: "3",
        name: "Lê Văn C",
        email: "c@gmail.com",
        ratingAvg: 4.2,
        ratingCount: 8,
      },
    ]);
  }, []);

  // Sắp xếp trước theo ratingAvg
  const sortedData = [...userData].sort((a, b) => b.ratingAvg - a.ratingAvg);

  const columns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      render: (_, __, index) => {
        const rank = index + 1;
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
      render: (text, _, index) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} />
          <span className="font-medium">
            {text}
            {index === 0 && (
              <span className="ml-1 text-yellow-500 font-bold">👑</span>
            )}
          </span>
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
            isHalf={true}
            edit={false}
            activeColor="#fadb14"
          />
          <Tooltip title={`${record.ratingCount} lượt đánh giá`}>
            <span className="text-sm text-gray-500">({record.ratingCount})</span>
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
          rowKey="id"
          pagination={{ pageSize: 5 }}
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
    </div>
  );
};

export default Ranking;
