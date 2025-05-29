import React, { useState, useRef, useEffect } from "react";
import "../style/chatbot.css";
import { robotImg, userImg } from "../utils/imageImports.js";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

// Create a singleton socket instance to prevent multiple connections
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    console.log("Creating new socket connection");
    socketInstance = io(API_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ["websocket"]
    });
  }
  return socketInstance;
};

// Get the singleton socket instance
const socket = getSocket();

// Add connection monitoring
socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

const Chatbot = ({ showChatbot, setShowChatbot }) => {
  const [inputText, setInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = sessionStorage.getItem("chat_messages");
    return saved
      ? JSON.parse(saved)
      : [
          {
            message: "Xin chào! Tôi có thể giúp gì cho bạn?",
            sender: "robot",
            id: "id1",
          },
        ];
  });

  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  //nhận tin nhắn từ RASA qua backend Socket.IO
  useEffect(() => {
    console.log("Chatbot component mounted, setting up socket listeners");
    
    // Setup socket event listener
    socket.on("bot_reply", (msg) => {
      setIsBotTyping(false);

      const botMessage = {
        message: msg.text, // Lưu text vào message để tương thích ngược
        sender: "robot",
        id: crypto.randomUUID(),
        structuredData: msg.structured_data || null // Lưu dữ liệu có cấu trúc nếu có
      };
      
      setChatMessages((prev) => [...prev, botMessage]);
    });

    return () => {
      console.log("Chatbot component unmounted, cleaning up socket listeners");
      socket.off("bot_reply");
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || isBotTyping) return;

    const userMessage = {
      message: inputText,
      sender: "user",
      id: crypto.randomUUID(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsBotTyping(true);
    socket.emit("user_message", inputText);
  };

  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Render một voucher
  const renderVoucher = (voucher, index) => {
    return (
      <div className="voucher-card" key={index}>
        <div className="voucher-header">
          <strong>Voucher {voucher.number}</strong>
          {voucher.rating && <span className="rating">⭐ {voucher.rating}</span>}
        </div>
        
        <div className="voucher-details">
          {voucher.platform && (
            <div className="voucher-detail">
              <span className="detail-label">Nền tảng:</span> {voucher.platform}
            </div>
          )}
          
          {voucher.category && (
            <div className="voucher-detail">
              <span className="detail-label">Danh mục:</span> {voucher.category}
            </div>
          )}
          
          {voucher.discount && (
            <div className="voucher-detail discount">
              <span className="detail-label">Giảm giá:</span> {voucher.discount}
            </div>
          )}
          
          {voucher.price && (
            <div className="voucher-detail">
              <span className="detail-label">Giá:</span> {voucher.price}
            </div>
          )}
          
          {voucher.expiration && (
            <div className="voucher-detail">
              <span className="detail-label">Hạn sử dụng:</span> {voucher.expiration}
            </div>
          )}
          
          {voucher.code && (
            <div className="voucher-code">
              <span className="detail-label">Mã:</span> 
              <span className="code">{voucher.code}</span>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(voucher.code);
                  alert("Đã sao chép mã: " + voucher.code);
                }}
              >
                Sao chép
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render nội dung tin nhắn dựa trên loại dữ liệu
  const renderMessageContent = (message, structuredData) => {
    // Nếu có dữ liệu voucher có cấu trúc
    if (structuredData && structuredData.vouchers && structuredData.vouchers.length > 0) {
      return (
        <div className="structured-message">
          {/* Hiển thị text gốc hoặc thông báo riêng */}
          <div className="message-text">{message}</div>
          
          {/* Hiển thị danh sách voucher */}
          <div className="vouchers-container">
            {structuredData.vouchers.map((voucher, index) => 
              renderVoucher(voucher, index)
            )}
          </div>
        </div>
      );
    } 
    
    // Nếu message là object nhưng không phải dạng voucher có cấu trúc
    if (typeof message === "object") {
      return <pre>{JSON.stringify(message, null, 2)}</pre>;
    }
    
    // Trường hợp thông thường: message là text
    return message;
  };

  return (
    <>
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-header" onClick={() => setShowChatbot(false)}>
            <span>🤖 AI Chatbot</span>
          </div>
          <div className="chat-messages-container" ref={chatMessagesRef}>
            {chatMessages.map(({ message, sender, id, structuredData }) => (
              <div
                key={id}
                className={
                  sender === "user" ? "chat-message-user" : "chat-message-robot"
                }
              >
                {sender === "robot" && (
                  <img
                    src={robotImg}
                    alt="Robot"
                    className="chat-message-profile"
                  />
                )}
                
                <div className="chat-message-text">
                  {renderMessageContent(message, structuredData)}
                </div>

                {sender === "user" && (
                  <img
                    src={userImg}
                    alt="User"
                    className="chat-message-profile"
                  />
                )}
              </div>
            ))}
              
            {/* Hiển thị "Bot đang nhập..." khi bot đang nhập */}
            {isBotTyping && (
              <div className="chat-message-robot">
                <img src={robotImg} alt="Bot" className="chat-message-profile" />
                <div className="chat-message-text typing-indicator">
                  Đang nhập<span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <button onClick={handleSendMessage} className="send-button">
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;