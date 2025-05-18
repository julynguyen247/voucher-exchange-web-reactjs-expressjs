import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Alert, Spin } from 'antd';
import {
  UserOutlined,
  TagsOutlined,
  TransactionOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { getDashboardStatsApi, getTransactions, getVoucher } from '../../../utils/api';
import { Line } from '@ant-design/plots';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalVouchers: 0,
    soldVouchers: 0,
    availableVouchers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    platformStats: [],
    categoryStats: [],
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [popularVouchers, setPopularVouchers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API thống kê từ backend
        let dashboardData = {};
        try {
          const statsResponse = await getDashboardStatsApi();
          dashboardData = statsResponse?.data?.data || {};
        } catch (statsError) {
          console.error('Lỗi khi tải dữ liệu thống kê:', statsError);
        }
        
        // Lấy dữ liệu giao dịch để hiển thị giao dịch gần đây
        let transactions = [];
        try {
          const transactionsResponse = await getTransactions();
          transactions = transactionsResponse?.data?.data || [];
        } catch (transError) {
          console.error('Lỗi khi tải dữ liệu giao dịch:', transError);
        }
        
        // Lấy dữ liệu voucher để hiển thị voucher phổ biến
        let vouchers = [];
        try {
          const vouchersResponse = await getVoucher();
          vouchers = vouchersResponse?.data?.data || [];
        } catch (voucherError) {
          console.error('Lỗi khi tải dữ liệu voucher:', voucherError);
        }
        
        // Cập nhật các thống kê từ API
        setStats({
          totalUsers: dashboardData.userStats?.total || 0,
          newUsers: dashboardData.userStats?.newUsers || 0,
          totalVouchers: dashboardData.voucherStats?.total || 0,
          soldVouchers: dashboardData.voucherStats?.sold || 0,
          availableVouchers: dashboardData.voucherStats?.available || 0,
          totalTransactions: dashboardData.transactionStats?.total || 0,
          totalRevenue: dashboardData.revenueStats?.total || 0,
          platformStats: dashboardData.platformStats || [],
          categoryStats: dashboardData.categoryStats || [],
        });
        
        // Cập nhật dữ liệu biểu đồ doanh thu theo tháng
        if (dashboardData.revenueStats?.monthly && dashboardData.revenueStats.monthly.length > 0) {
          setChartData(dashboardData.revenueStats.monthly);
        } else {
          // Dữ liệu mẫu nếu không có dữ liệu từ API
          setChartData([
            { month: 'Tháng 1', sales: 0 },
            { month: 'Tháng 2', sales: 0 },
            { month: 'Tháng 3', sales: 0 },
            { month: 'Tháng 4', sales: 0 },
            { month: 'Tháng 5', sales: 0 },
            { month: 'Tháng 6', sales: 0 },
            { month: 'Tháng 7', sales: 0 },
            { month: 'Tháng 8', sales: 0 },
            { month: 'Tháng 9', sales: 0 },
            { month: 'Tháng 10', sales: 0 },
            { month: 'Tháng 11', sales: 0 },
            { month: 'Tháng 12', sales: 0 },
          ]);
        }
        
        // Lấy 5 giao dịch gần nhất
        setRecentTransactions(
          transactions.slice(0, 5).map(trans => ({
            key: trans._id,
            id: trans._id,
            user: trans.userId,
            voucher: trans.voucherId,
            amount: trans.amount,
            date: new Date(trans.createdAt).toLocaleDateString(),
            status: trans.status || 'Hoàn thành',
          }))
        );
        
        // Xử lý vouchers phổ biến
        const voucherMap = {};
        transactions.forEach(trans => {
          if (trans.voucherId) {
            voucherMap[trans.voucherId] = (voucherMap[trans.voucherId] || 0) + 1;
          }
        });
        
        const popularVoucherIds = Object.keys(voucherMap)
          .sort((a, b) => voucherMap[b] - voucherMap[a])
          .slice(0, 5);
        
        const popularVouchersData = vouchers
          .filter(v => popularVoucherIds.includes(v._id))
          .map(v => ({
            key: v._id,
            id: v._id,
            platform: v.platform,
            category: v.category,
            discount: v.discountValue + '%',
            price: v.price,
            sales: voucherMap[v._id] || 0,
          }));
        
        setPopularVouchers(popularVouchersData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      ellipsis: true,
    },
    {
      title: 'Voucher',
      dataIndex: 'voucher',
      key: 'voucher',
      ellipsis: true,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount?.toLocaleString()}đ`,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'Hoàn thành' ? '#52c41a' : 
                 status === 'Đang xử lý' ? '#1890ff' : 
                 '#faad14',
        }}>
          {status}
        </span>
      ),
    },
  ];

  const voucherColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString()}đ`,
    },
    {
      title: 'Lượt bán',
      dataIndex: 'sales',
      key: 'sales',
    },
  ];

  // Trạng thái cho dữ liệu biểu đồ
  const [chartData, setChartData] = useState([]);

  const config = {
    data: chartData,
    xField: 'month',
    yField: 'sales',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Doanh thu', value: `${datum.sales.toLocaleString()}đ` };
      },
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng voucher"
              value={stats.totalVouchers}
              prefix={<TagsOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={stats.totalTransactions}
              prefix={<TransactionOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#f5222d' }} />}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24} style={{ marginBottom: 24 }}>
          <Card title="Doanh thu theo tháng">
            <Line {...config} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Giao dịch gần đây" style={{ marginBottom: 16 }}>
            <Table 
              columns={transactionColumns} 
              dataSource={recentTransactions} 
              pagination={false} 
              size="small"
            />
          </Card>

          <Card title="Thống kê Voucher">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Tổng Voucher"
                  value={stats.totalVouchers}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đã bán"
                  value={stats.soldVouchers || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Còn lại"
                  value={stats.availableVouchers || (stats.totalVouchers - (stats.soldVouchers || 0))}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Voucher phổ biến" style={{ marginBottom: 16 }}>
            <Table 
              columns={voucherColumns} 
              dataSource={popularVouchers} 
              pagination={false} 
              size="small"
            />
          </Card>
          
          <Card title="Thống kê người dùng">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Tổng người dùng"
                  value={stats.totalUsers}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Mới trong 30 ngày"
                  value={stats.newUsers || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
