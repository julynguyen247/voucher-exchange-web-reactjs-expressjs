import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, Badge, Space, Input, DatePicker, message, Select } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllTransactionsApi } from '../../../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchTransactions = async (page = 1, pageSize = 10, filters = {}) => {
    setLoading(true);
    try {
      const response = await getAllTransactionsApi(pageSize, page, filters);
      const { data } = response.data;
      
      // Xử lý dữ liệu giao dịch
      const processedTransactions = (data?.transactions || data || []).map(transaction => ({
        key: transaction._id,
        id: transaction._id,
        userId: transaction.userId,
        voucherId: transaction.voucherId,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod || 'VOU Token',
        createdAt: transaction.createdAt,
        status: transaction.status || 'Hoàn thành',
        transactionHash: transaction.transactionHash || '-',
        seller: transaction.seller || transaction.sellerId || 'Hệ thống',
        buyer: transaction.buyer || transaction.buyerId || transaction.userId,
      }));
      
      setTransactions(processedTransactions);
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: data.total || processedTransactions.length,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách giao dịch:', error);
      message.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination) => {
    const filters = buildFilters();
    fetchTransactions(pagination.current, pagination.pageSize, filters);
  };

  const showTransactionDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const buildFilters = () => {
    const filters = {};
    
    if (searchValue) {
      filters.q = searchValue;
    }
    
    if (dateRange) {
      filters.startDate = dateRange[0].format('YYYY-MM-DD');
      filters.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    
    if (statusFilter) {
      filters.status = statusFilter;
    }
    
    return filters;
  };

  const handleSearch = () => {
    const filters = buildFilters();
    fetchTransactions(1, pagination.pageSize, filters);
  };

  const resetFilters = () => {
    setSearchValue('');
    setDateRange(null);
    setStatusFilter(null);
    fetchTransactions(1, pagination.pageSize, {});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'success';
      case 'Đang xử lý':
        return 'processing';
      case 'Chờ thanh toán':
        return 'warning';
      case 'Đã hủy':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 220,
    },
    {
      title: 'Người bán',
      dataIndex: 'seller',
      key: 'seller',
      ellipsis: true,
    },
    {
      title: 'Người mua',
      dataIndex: 'buyer',
      key: 'buyer',
      ellipsis: true,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount?.toLocaleString()}đ`,
      sorter: (a, b) => a.amount - b.amount,
      width: 120,
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      filters: [
        { text: 'VOU Token', value: 'VOU Token' },
        { text: 'Ngân hàng', value: 'Ngân hàng' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={status} />
      ),
      filters: [
        { text: 'Hoàn thành', value: 'Hoàn thành' },
        { text: 'Đang xử lý', value: 'Đang xử lý' },
        { text: 'Chờ thanh toán', value: 'Chờ thanh toán' },
        { text: 'Đã hủy', value: 'Đã hủy' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => showTransactionDetail(record)}
        />
      ),
      width: 100,
      fixed: 'right',
    },
  ];

  return (
    <div>
      <h1>Quản lý giao dịch</h1>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Input.Search 
          placeholder="Tìm kiếm theo ID..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: 250 }}
          onSearch={handleSearch}
        />
        
        <RangePicker 
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="DD/MM/YYYY"
        />
        
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="Hoàn thành">Hoàn thành</Option>
          <Option value="Đang xử lý">Đang xử lý</Option>
          <Option value="Chờ thanh toán">Chờ thanh toán</Option>
          <Option value="Đã hủy">Đã hủy</Option>
        </Select>
        
        <Space>
          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Tìm kiếm
          </Button>
          <Button onClick={resetFilters}>Đặt lại</Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={transactions}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
        size="middle"
        bordered
        scroll={{ x: 1200 }}
      />
      
      <Modal
        title="Chi tiết giao dịch"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedTransaction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p>
                  <strong>ID giao dịch:</strong> {selectedTransaction.id}
                </p>
                <p>
                  <strong>Người bán:</strong> {selectedTransaction.seller}
                </p>
                <p>
                  <strong>Người mua:</strong> {selectedTransaction.buyer}
                </p>
                <p>
                  <strong>Số tiền:</strong> {selectedTransaction.amount?.toLocaleString()}đ
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p>
                  <strong>Phương thức thanh toán:</strong> {selectedTransaction.paymentMethod}
                </p>
                <p>
                  <strong>Thời gian:</strong> {new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  <Tag color={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Tag>
                </p>
                {selectedTransaction.transactionHash && selectedTransaction.transactionHash !== '-' && (
                  <p>
                    <strong>Transaction Hash:</strong> {selectedTransaction.transactionHash}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <strong>Voucher ID:</strong> {selectedTransaction.voucherId}
            </div>
            
            {selectedTransaction.note && (
              <div>
                <strong>Ghi chú:</strong>
                <p>{selectedTransaction.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionManagement;
