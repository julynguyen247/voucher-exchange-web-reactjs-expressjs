import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Avatar,
  Modal,
  Descriptions,
} from "antd";
import { CrownOutlined, UserOutlined } from "@ant-design/icons";

const Ranking = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setUserData([
      { id: "1", name: "Nguyễn Văn A", email: "a@gmail.com", score: 98 },
      { id: "2", name: "Trần Thị B", email: "b@gmail.com", score: 90 },
      { id: "3", name: "Lê Văn C", email: "c@gmail.com", score: 85 },
      { id: "4", name: "Phạm Thị D", email: "d@gmail.com", score: 80 },
    ]);
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => <ModalUser user={record} />,
    },

    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
      render: (text, _, index) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} />
          <span>
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
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      sorter: (a, b) => b.score - a.score,
      render: (score) => (
        <span
          className={
            score >= 90
              ? "text-green-600 font-semibold"
              : "text-gray-800 font-medium"
          }
        >
          {score}
        </span>
      ),
    },
  ];

  const topUser = userData[0];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">
        🏆 Bảng xếp hạng người dùng
      </h1>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card style={{ borderColor: "#91d5ff", backgroundColor: "#e6f7ff" }}>
            <Statistic
              title="Tổng số người dùng"
              value={userData.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ borderColor: "#ffe58f", backgroundColor: "#fffbe6" }}>
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
          dataSource={userData}
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

      <Modal
        open={isModalVisible}
        title="Thông tin người dùng"
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">
              {selectedUser.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Điểm">
              {selectedUser.score}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Ranking;
