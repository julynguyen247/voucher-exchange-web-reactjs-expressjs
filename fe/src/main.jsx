import VoucherPage from "./pages/client/voucher";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/client/home";
import { AuthWrapper } from "./components/context/auth.context";
import "./style/global.css";
import CreateVoucherPage from "./pages/client/createVoucher";
import { App } from "antd";
import AccountPage from "./pages/client/account/account";
import Layout from "./layout";
import LoginPage from "../src/pages/client/auth/login";
import RegisterPage from "../src/pages/client/auth/register";
import { createRoot } from "react-dom/client";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import OrderPage from "./pages/client/transactions/order";
import TransactionPage from "./pages/client/transactions/transaction";
import TransactionHistory from "./pages/client/transactions/transactionHistory";
import Favorites from "./pages/client/favorites";
import Rating from "./pages/client/rating";

// Admin imports
import AdminLayout from "./pages/admin/components/AdminLayout";
import UserManagement from "./pages/admin/users/UserManagement";
import VoucherManagement from "./pages/admin/vouchers/VoucherManagement";
import TransactionManagement from "./pages/admin/transactions/TransactionManagement";

import AdminProtectedRoute from "./pages/admin/components/AdminProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import Profile from "./pages/client/profile";
import PublicProfile from "./pages/client/PublicProfile";

const clientId =
  "672007328004-ulrqqgtah8i30rjrlon2of3loi3k8jp5.apps.googleusercontent.com";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/voucher",
        element: <VoucherPage />,
      },
      {
        path: "/create-voucher",
        element: <CreateVoucherPage />,
      },
      {
        path: "/account",
        element: <AccountPage />,
      },
      {
        path: "/order",
        element: <OrderPage />,
      },
      {
        path: "/transaction",
        element: <TransactionPage />,
      },
      {
        path: "/transaction-history",
        element: <TransactionHistory />,
      },
      {
        path: "/rating",
        element: <Rating />,
      },
      {
        path: "/favorites",
        element: <Favorites />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      { path: "/profile/:id", element: <PublicProfile /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  // Admin Routes
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <UserManagement />, // Trang mặc định khi vào /admin là Quản lý người dùng
      },
      {
        path: "/admin/users",
        element: <UserManagement />,
      },
      {
        path: "/admin/vouchers",
        element: <VoucherManagement />,
      },
      {
        path: "/admin/transactions",
        element: <TransactionManagement />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="672007328004-ulrqqgtah8i30rjrlon2of3loi3k8jp5.apps.googleusercontent.com">
      <HelmetProvider>
        <App>
          <AuthWrapper>
            <RouterProvider router={router} />
          </AuthWrapper>
        </App>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
