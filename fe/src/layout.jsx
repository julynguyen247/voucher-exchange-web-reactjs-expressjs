import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./components/context/auth.context";
import { fetchAccountApi } from "./utils/api";
import Chatbot from "./components/chatbot"; // Import Chatbot
import FloatingMetaMask from "./components/wallet/FloatingMetaMask"; // Import FloatingMetaMask

const Layout = () => {
  const { setAuth } = useContext(AuthContext);
  const [showChatbot, setShowChatbot] = useState(false); // Trạng thái bật/tắt Chatbot
  const authCheckRef = useRef(false);

  // Only execute this once when the component mounts
  useEffect(() => {
    // Use ref to track if we've already checked auth to prevent duplicate checks
    // This persists through StrictMode double renders
    if (authCheckRef.current) {
      return;
    }
    authCheckRef.current = true;

    const checkAuth = async () => {
      try {
        // Check if we already have auth data in localStorage
        const savedAuth = localStorage.getItem("auth");
        const parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;
        const hasValidAuthData =
          parsedAuth &&
          parsedAuth.isAuthenticated &&
          parsedAuth.user &&
          parsedAuth.user.email;

        // Only fetch if we don't have valid auth data
        if (!hasValidAuthData) {
          console.log("No valid cached auth data found, fetching from API");
          const res = await fetchAccountApi();

          if (res?.data?.data) {
            const userData = {
              isAuthenticated: true,
              user: {
                email: res.data.data.email ?? "",
                name: res.data.data.name ?? "",
                phone: res.data.data.phone ?? "",
                id: res.data.data._id ?? "",
                image: res.data.data.image ?? "",
                role: res.data.data.role ?? "",
              },
            };
            setAuth(userData);
          } else {
            setAuth({
              isAuthenticated: false,
              user: {
                email: "",
                name: "",
                phone: "",
                id: "",
                image: "",
                role: "",
              },
            });
          }
        }
      } catch (error) {
        console.error("Error during auth check:", error);
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: "",
            phone: "",
            id: "",
            image: "",
            role: "",
          },
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <div>
      <AppHeader />
      <Outlet />

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

      {showChatbot && (
        <Chatbot showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
      )}

      <FloatingMetaMask />
    </div>
  );
};

export default Layout;
