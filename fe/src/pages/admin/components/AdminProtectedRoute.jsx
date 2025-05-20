import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../components/context/auth.context';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Only log once during initial render, not on every state update
  React.useEffect(() => {
    console.log("Admin route auth state:", { 
      email: user?.email, 
      role: user?.role, 
      isAuthenticated 
    });
  }, []);
  
  // Kiểm tra xem người dùng đã đăng nhập và có quyền admin hay không
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra quyền admin (cần thêm trường isAdmin vào model User)
  // Tạm thời giả lập quyền admin bằng user ID cụ thể hoặc email
  // Trong thực tế, cần kiểm tra quyền hạn thực sự trong CSDL
  const isAdmin = user && (
    user.email === 'pewepic@gmail.com' || 
    user.email === 'vngbthi@gmail.com' ||
    user.role?.toLowerCase() === 'admin'
  );
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
