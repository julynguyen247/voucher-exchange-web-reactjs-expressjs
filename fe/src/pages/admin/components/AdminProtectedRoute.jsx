import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../components/context/auth.context';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("Auth state in AdminProtectedRoute:", { user, isAuthenticated });
  
  // Kiểm tra xem người dùng đã đăng nhập và có quyền admin hay không
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra quyền admin (cần thêm trường isAdmin vào model User)
  // Tạm thời giả lập quyền admin bằng user ID cụ thể hoặc email
  // Trong thực tế, cần kiểm tra quyền hạn thực sự trong CSDL
  const isAdmin = user && (
    user.email === 'pewepic@gmail.com' || 
    user.role === 'admin' ||
    user.role === 'ADMIN' ||
    user.role === 'Admin'
  );
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
