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
import OrderPage from "./pages/client/order";
import TransactionPage from "./pages/client/transaction";
import TransactionHistory from "./pages/client/transactionHistory";

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
]);

createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <App>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </App>
  // </React.StrictMode>
);
