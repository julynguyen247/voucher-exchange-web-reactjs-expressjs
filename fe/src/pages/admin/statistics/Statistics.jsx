import React, { useState, useEffect } from 'react';
import { Row, Col, Card, DatePicker, Button, Statistic, Spin, Alert, Tabs } from 'antd';
import { 
  UserOutlined, 
  TagsOutlined, 
  TransactionOutlined, 
  DollarCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { getDashboardStatsApi, getAllVouchersApi, getAllUsersApi, getTransactions } from '../../../utils/api';
import { Line, Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [statistics, setStatistics] = useState({
    userStats: {
      total: 0,
      growth: 0,
      periodNew: 0,
      data: []
    },
    voucherStats: {
      total: 0,
      sold: 0,
      available: 0,
      periodNew: 0,
      data: []
    },
    transactionStats: {
      total: 0,
      periodCount: 0,
      growth: 0,
      data: []
    },
    revenueStats: {
      total: 0,
      periodTotal: 0,
      growth: 0,
      data: []
    },
    platformStats: {
      data: []
    },
    categoryStats: {
      data: []
    }
  });
  
  // Function to generate timeline data for charts
  const generateTimelineData = (startDate, endDate, data, type) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const dayCount = end.diff(start, 'day') + 1;
    const results = [];
    
    // Create a map of dates for quick lookup
    const dataByDate = {};
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.createdAt) {
          const date = dayjs(item.createdAt).format('YYYY-MM-DD');
          if (!dataByDate[date]) dataByDate[date] = [];
          dataByDate[date].push(item);
        }
      });
    }
    
    // Generate data for each day in the range
    for (let i = 0; i < dayCount; i++) {
      const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
      const dateItems = dataByDate[currentDate] || [];
      
      let value = 0;
      if (type === 'revenue' && dateItems.length > 0) {
        value = dateItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      } else {
        value = dateItems.length;
      }
      
      results.push({
        date: currentDate,
        value: value
      });
    }
    
    return results;
  };
  
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      // Fetch data from API endpoints
      const statsResponse = await getDashboardStatsApi();
      const usersResponse = await getAllUsersApi(100, 1);
      const vouchersResponse = await getAllVouchersApi(100, 1);
      const transactionsResponse = await getTransactions();
      
      const dashboardStats = statsResponse.data.data || {};
      const users = usersResponse.data.data?.users || [];
      const vouchers = vouchersResponse.data.data?.vouchers || vouchersResponse.data.data || [];
      const transactions = transactionsResponse.data.data || [];
      
      // Filter data for the selected date range
      const startDateTime = dayjs(startDate).startOf('day');
      const endDateTime = dayjs(endDate).endOf('day');
      
      const filteredUsers = users.filter(user => {
        const createdAt = dayjs(user.createdAt);
        return createdAt.isAfter(startDateTime) && createdAt.isBefore(endDateTime);
      });
      
      const filteredTransactions = transactions.filter(transaction => {
        const createdAt = dayjs(transaction.createdAt);
        return createdAt.isAfter(startDateTime) && createdAt.isBefore(endDateTime);
      });
      
      // Calculate period revenue
      const periodRevenue = filteredTransactions.reduce((sum, transaction) => 
        sum + (transaction.amount || 0), 0);
      
      // Generate timeline data
      const userTimelineData = generateTimelineData(startDate, endDate, filteredUsers, 'users');
      const voucherTimelineData = generateTimelineData(startDate, endDate, vouchers.filter(v => {
        const createdAt = dayjs(v.createdAt);
        return createdAt.isAfter(startDateTime) && createdAt.isBefore(endDateTime);
      }), 'vouchers');
      const transactionTimelineData = generateTimelineData(startDate, endDate, filteredTransactions, 'transactions');
      const revenueTimelineData = generateTimelineData(startDate, endDate, filteredTransactions, 'revenue');
      
      // Extract platform and category statistics
      const platforms = {};
      vouchers.forEach(voucher => {
        platforms[voucher.platform] = (platforms[voucher.platform] || 0) + 1;
      });
      
      const platformData = Object.keys(platforms).map(platform => ({
        type: platform,
        value: platforms[platform]
      }));
      
      const categories = {};
      vouchers.forEach(voucher => {
        categories[voucher.category] = (categories[voucher.category] || 0) + 1;
      });
      
      const categoryData = Object.keys(categories).map(category => ({
        type: category,
        value: categories[category]
      }));
      
      // Update statistics state with real data
      setStatistics({
        userStats: {
          total: dashboardStats?.userStats?.total || users.length,
          growth: 5.2, // Placeholder - would need historical data to calculate real growth
          periodNew: filteredUsers.length,
          data: userTimelineData.map(item => ({
            date: item.date,
            value: item.value,
            type: 'Người dùng mới'
          }))
        },
        voucherStats: {
          total: dashboardStats?.voucherStats?.total || vouchers.length,
          sold: dashboardStats?.voucherStats?.sold || vouchers.filter(v => v.sold).length,
          available: dashboardStats?.voucherStats?.available || vouchers.filter(v => !v.sold).length,
          periodNew: voucherTimelineData.reduce((sum, item) => sum + item.value, 0),
          data: voucherTimelineData.map(item => ({
            date: item.date,
            value: item.value,
            type: 'Voucher mới'
          }))
        },
        transactionStats: {
          total: dashboardStats?.transactionStats?.total || transactions.length,
          periodCount: filteredTransactions.length,
          growth: 8.1, // Placeholder - would need historical data to calculate real growth
          data: transactionTimelineData.map(item => ({
            date: item.date,
            value: item.value,
            type: 'Giao dịch'
          }))
        },
        revenueStats: {
          total: dashboardStats?.revenueStats?.total || transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0),
          periodTotal: periodRevenue,
          growth: 12.3, // Placeholder - would need historical data to calculate real growth
          data: revenueTimelineData.map(item => ({
            date: item.date,
            value: item.value,
            type: 'Doanh thu'
          }))
        },
        platformStats: {
          data: dashboardStats?.platformStats || platformData
        },
        categoryStats: {
          data: dashboardStats?.categoryStats || categoryData
        }
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };
  
  const handleApplyDateRange = () => {
    fetchStatistics();
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
  
  // Cấu hình cho biểu đồ đường
  const lineConfig = (data, yField) => ({
    data,
    xField: 'date',
    yField,
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v) => {
          return yField === 'value' && v >= 10000 
            ? `${(v / 1000000).toFixed(1)}M` 
            : v;
        },
      },
    },
    tooltip: {
      formatter: (data) => {
        return { name: data.type, value: yField === 'value' && data.value >= 10000 ? `${data.value.toLocaleString()}đ` : data.value };
      },
    },
    legend: { position: 'top' },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  });
  
  // Cấu hình cho biểu đồ cột
  const columnConfig = (data) => ({
    data,
    xField: 'date',
    yField: 'value',
    tooltip: {
      formatter: (data) => {
        return { name: 'Doanh thu', value: `${data.value.toLocaleString()}đ` };
      },
    },
    color: '#1890ff',
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    },
  });
  
  // Cấu hình cho biểu đồ tròn
  const pieConfig = (data) => ({
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  });
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Thống kê chi tiết</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <RangePicker 
            value={dateRange} 
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Button type="primary" onClick={handleApplyDateRange}>
            Áp dụng
          </Button>
        </div>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={statistics.userStats.total}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, marginLeft: 8 }}>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} /> {statistics.userStats.growth}%
                </span>
              }
            />
            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>
              {statistics.userStats.periodNew} người dùng mới trong kỳ
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng voucher"
              value={statistics.voucherStats.total}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<TagsOutlined />}
            />
            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>
              Đã bán: {statistics.voucherStats.sold} | Còn lại: {statistics.voucherStats.available}
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Giao dịch"
              value={statistics.transactionStats.total}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<TransactionOutlined />}
              suffix={
                <span style={{ fontSize: 14, marginLeft: 8 }}>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} /> {statistics.transactionStats.growth}%
                </span>
              }
            />
            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>
              {statistics.transactionStats.periodCount} giao dịch trong kỳ
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={statistics.revenueStats.total}
              precision={0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
            />
            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>
              {statistics.revenueStats.periodTotal.toLocaleString()}đ trong kỳ
              <span style={{ marginLeft: 8 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> {statistics.revenueStats.growth}%
              </span>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="revenue" style={{ marginBottom: 24 }}>
        <TabPane tab="Doanh thu" key="revenue">
          <Card title="Biểu đồ doanh thu theo ngày">
            <Column {...columnConfig(statistics.revenueStats.data)} height={400} />
          </Card>
        </TabPane>
        
        <TabPane tab="Người dùng" key="users">
          <Card title="Biểu đồ người dùng mới theo ngày">
            <Line {...lineConfig(statistics.userStats.data, 'value')} height={400} />
          </Card>
        </TabPane>
        
        <TabPane tab="Voucher" key="vouchers">
          <Card title="Biểu đồ voucher mới theo ngày">
            <Line {...lineConfig(statistics.voucherStats.data, 'value')} height={400} />
          </Card>
        </TabPane>
        
        <TabPane tab="Giao dịch" key="transactions">
          <Card title="Biểu đồ giao dịch theo ngày">
            <Line {...lineConfig(statistics.transactionStats.data, 'value')} height={400} />
          </Card>
        </TabPane>
      </Tabs>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Thống kê theo nền tảng">
            <Pie {...pieConfig(statistics.platformStats.data)} height={400} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thống kê theo danh mục">
            <Pie {...pieConfig(statistics.categoryStats.data)} height={400} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
