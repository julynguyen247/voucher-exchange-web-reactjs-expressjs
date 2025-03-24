import { Tabs } from 'antd'
import React from 'react'
import Info from './info';
import ChangePassword from './changePassword';

const AccountPage = () => {
    const items = [
        {
          key: '1',
          label: 'Change Info',
          children: <Info></Info>,
        },
        {
          key: '2',
          label: 'Change Password',
          children: <ChangePassword></ChangePassword>,
        },
      ];
  return (
    <div>
       <Tabs defaultActiveKey="1" items={items} centered tabBarGutter={50} />
    </div>
  )
}

export default AccountPage
