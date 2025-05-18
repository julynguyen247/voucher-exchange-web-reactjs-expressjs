import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Dropdown, Button } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TagsOutlined,
  TransactionOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'vouchers',
      icon: <TagsOutlined />,
      label: 'Quản lý voucher',
      onClick: () => navigate('/admin/vouchers'),
    },
    {
      key: 'transactions',
      icon: <TransactionOutlined />,
      label: 'Quản lý giao dịch',
      onClick: () => navigate('/admin/transactions'),
    },
  ];

  const userDropdownItems = {
    items: [
      {
        key: '1',
        label: 'Trang người dùng',
        icon: <HomeOutlined />,
        onClick: () => navigate('/'),
      },
      {
        key: '2',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        onClick: () => {
          localStorage.removeItem('access_token');
          navigate('/login');
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
          <Link to="/admin">
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {collapsed ? 'VE' : 'Voucher Exchange'}
            </Title>
          </Link>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['dashboard']}
          items={items}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header 
          style={{ 
            padding: '0 16px', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dropdown menu={userDropdownItems} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            borderRadius: 4,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
