import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./components/context/auth.context";
import { fetchAccountApi } from "./utils/api";
import Chatbot from "./components/chatbot"; // Import Chatbot

const Layout = () => {
  const { setAuth } = useContext(AuthContext);
  const [showChatbot, setShowChatbot] = useState(false); // Trạng thái bật/tắt Chatbot

  useEffect(() => {
    const fetchAcc = async () => {
      try {
        const res = await fetchAccountApi();
        if (res?.data) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.data.data.email ?? "",
              name: res.data.data.name ?? "",
              phone: res.data.data.phone ?? "",
              id: res.data.data._id ?? "",
              image: res.data.data.image ?? "",
            },
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: {
              email: "",
              name: "",
              phone: "",
              id: "",
              image: "",
            },
          });
        }
      } catch(error) {
        console.error("Error fetching account data:", error);
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: "",
          },
        });
      }
    };

    fetchAcc();
  }, [setAuth]);

  return (
    <div>
      <AppHeader />
      <Outlet />

      {/* Nút bật/tắt chatbot */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 15px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        💬
      </button>

      {/* Hiển thị Chatbot khi showChatbot === true */}
      {showChatbot && <Chatbot />}
    </div>
  );
};

export default Layout;
