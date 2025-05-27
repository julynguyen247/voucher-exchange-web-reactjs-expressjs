import React, { useEffect, useState, useCallback } from "react";
import { ratingApi } from "../../utils/api.js";

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
      console.log("API response:", res.data);

      if (res.data && Array.isArray(res.data.users)) {
        setUserData(res.data.users);
        
        if (res.data.pagination) {
          setPagination({
            current: res.data.pagination.page,
            pageSize: res.data.pagination.limit,
            total: res.data.pagination.total
          });
        }
      } else {
        console.error("Cấu trúc dữ liệu không như mong đợi:", res.data);
        message.error("Không thể tải danh sách người dùng do cấu trúc dữ liệu không hợp lệ!");
      }
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

  // Responsive columns configuration
  const getColumns = () => {
    // Kiểm tra kích thước màn hình
    const isMobile = window.innerWidth < 768;
    
    const baseColumns = [
      // Ở phần render của cột "Hạng"
      {  
        title: "Hạng",
        key: "rank",
        width: isMobile ? 60 : 80,
        render: (_, record, index) => {
          // Tính toán thứ hạng thực tế dựa trên trang hiện tại
          const actualRank = (pagination.current - 1) * pagination.pageSize + index + 1;
          
          // Chỉ rank 1 có định dạng đặc biệt
          if (actualRank === 1) {
            return (
              <div className="flex items-center justify-center">
                <span className={`font-bold text-yellow-500 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-100`}>
                  {actualRank}
                </span>
              </div>
            );
          }
          
          // Tất cả các rank khác (2 trở lên) sẽ có định dạng giống nhau
          return (
            <div className="text-center font-medium text-gray-700">
              {actualRank}
            </div>
          );
        },
      },
      {
        title: "Tên người dùng",
        dataIndex: "name",
        key: "name",
        render: (text, record, index) => {
          // Tính rank thực tế dựa trên vị trí trang
          const actualRank = (pagination.current - 1) * pagination.pageSize + index + 1;
          
          return (
            <div className="flex items-center gap-2">
              <Avatar 
                size={isMobile ? "small" : "default"}
                icon={<UserOutlined />} 
                className={actualRank <= 3 ? "border-2 shadow-sm " + 
                  (actualRank === 1 ? "border-yellow-400" : 
                  actualRank === 2 ? "border-gray-300" : 
                  "border-amber-500") : ""}
              />
              <Button
                type="link"
                className="p-0 flex items-center hover:text-indigo-600 font-medium text-xs md:text-sm"
                onClick={() => {
                  setSelectedUser(record);
                  setOpen(true);
                }}
              >
                {isMobile && text.length > 15 ? `${text.substring(0, 15)}...` : text}
                {actualRank === 1 && (
                  <span className="ml-1 text-yellow-500 flex items-center">
                    <CrownOutlined className={isMobile ? "text-sm" : "text-lg"} />
                  </span>
                )}
              </Button>
            </div>
          );
        },
      },
      {
        title: "Đánh giá",
        dataIndex: "ratingAvg",
        key: "ratingAvg",
        sorter: (a, b) => b.ratingAvg - a.ratingAvg,
        render: (ratingAvg, record) => (
          <div className="flex flex-col md:flex-row md:items-center gap-1">
            <ReactStars
              count={5}
              value={ratingAvg}
              size={isMobile ? 16 : 20}
              edit={true}
              isHalf={true}
              activeColor="#fadb14"
              onChange={(newRating) => handleRatingChange(newRating, record)}
            />
            <Tooltip title={`${record.ratingCount} lượt đánh giá`}>
              <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {record.ratingCount}
              </span>
            </Tooltip>
          </div>
        ),
      },
    ];

    // Thêm cột email nếu không phải màn hình mobile
    if (!isMobile) {
      return [
        ...baseColumns.slice(0, 2),
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
          render: (email) => (
            <span className="text-gray-600 text-sm">{email}</span>
          )
        },
        ...baseColumns.slice(2)
      ];
    }

    return baseColumns;
  };

  // State để lưu trữ kích thước màn hình hiện tại
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  
  // Effect theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive columns mỗi khi kích thước cửa sổ thay đổi
  const columns = getColumns();
  const isMobile = windowSize < 768;

  const topUser = sortedData[0];

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-indigo-700 flex items-center justify-center gap-2">
          <CrownOutlined className="text-yellow-500" /> 
          <span>Đánh giá người dùng</span>
        </h1>

        <Row gutter={[12, 12]} className="mb-4 md:mb-8">
          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-md hover:shadow-lg transition-shadow"
              style={{ 
                borderColor: "#91d5ff", 
                backgroundColor: "#e6f7ff", 
                borderRadius: "12px",
                padding: isMobile ? "8px" : "16px"
              }}
              bodyStyle={{ padding: isMobile ? "12px" : "24px" }}
              headStyle={{ color: "#1890ff" }}
            >
              <Statistic
                title={<span className="text-blue-800 font-medium text-sm md:text-base">Tổng số người dùng</span>}
                value={userData.length}
                prefix={<UserOutlined className="text-blue-600 mr-1" />}
                className="flex flex-col items-center justify-center h-full"
                valueStyle={{ 
                  color: "#1890ff", 
                  fontWeight: "bold", 
                  fontSize: isMobile ? "20px" : "28px" 
                }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              className="h-full shadow-md hover:shadow-lg transition-shadow"
              style={{ 
                borderColor: "#ffe58f", 
                backgroundColor: "#fffbe6", 
                borderRadius: "12px",
                padding: isMobile ? "8px" : "16px"
              }}
              bodyStyle={{ padding: isMobile ? "12px" : "24px" }}
              headStyle={{ color: "#faad14" }}
            >
              <Statistic
                title={<span className="text-yellow-800 font-medium text-sm md:text-base">Top 1</span>}
                value={topUser?.name || "Chưa có"}
                prefix={<CrownOutlined className="text-yellow-500 mr-1" />}
                className="flex flex-col items-center justify-center h-full"
                valueStyle={{ 
                  color: "#faad14", 
                  fontWeight: "bold", 
                  fontSize: isMobile ? "18px" : "28px",
                  // Cắt ngắn tên nếu quá dài trên mobile
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "100%"
                }}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          className="shadow-lg rounded-xl overflow-hidden border-0"
          bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
        >
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={sortedData}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: isMobile ? 10 : pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => fetchUsers(page, pageSize),
                className: "pb-2 md:pb-4",
                size: isMobile ? "small" : "default",
                simple: isMobile, // Sử dụng simple pagination trên mobile
                showSizeChanger: !isMobile
              }}

              className="rounded-lg"
              size={isMobile ? "small" : "middle"}
              scroll={{ x: isMobile ? 400 : undefined }}
            />
          </div>
        </Card>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar 
              size={isMobile ? "default" : "large"} 
              icon={<UserOutlined />} 
              className="border-2 border-indigo-300"
            />
            <span className={`${isMobile ? "text-base" : "text-xl"} font-bold`}>
              Thông tin người dùng
            </span>
          </div>
        }
        placement="right"
        width={isMobile ? "90%" : 360}
        onClose={() => setOpen(false)}
        open={open}
        className="rounded-l-lg"
        bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
      >
        {selectedUser && (
          <div className="space-y-4 md:space-y-6">
            <Descriptions 
              column={1} 
              bordered 
              size={isMobile ? "small" : "middle"}
              className="rounded-lg overflow-hidden shadow-sm"
              labelStyle={{ 
                fontWeight: "bold", 
                backgroundColor: "#f0f5ff",
                fontSize: isMobile ? "12px" : "14px",
                padding: isMobile ? "4px 8px" : "8px 16px"
              }}
              contentStyle={{ 
                backgroundColor: "white",
                fontSize: isMobile ? "12px" : "14px",
                padding: isMobile ? "4px 8px" : "8px 16px"
              }}
            >
              <Descriptions.Item label="Họ tên">
                {selectedUser.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <span style={{ 
                  wordBreak: "break-all", 
                  display: "block",
                  fontSize: isMobile ? "12px" : "14px"
                }}>
                  {selectedUser.email}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="ID">
                <span className="text-gray-500 font-mono" style={{ 
                  fontSize: isMobile ? "10px" : "12px",
                  wordBreak: "break-all"
                }}>
                  {selectedUser._id}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượt đánh giá">
                <span className="font-bold text-blue-600">
                  {selectedUser.ratingCount}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm trung bình">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-500">
                    {selectedUser.ratingAvg.toFixed(1)}
                  </span>
                  <ReactStars
                    count={5}
                    value={selectedUser.ratingAvg}
                    size={isMobile ? 16 : 18}
                    edit={false}
                    isHalf={true}
                    activeColor="#fadb14"
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
            
            <div className="pt-2 md:pt-4">
              <Button 
                block 
                type="primary" 
                onClick={() => setOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 h-8 md:h-10 rounded-lg"
                style={{ fontSize: isMobile ? "14px" : "16px" }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Rating;