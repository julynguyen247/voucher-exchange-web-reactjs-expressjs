import React, { useState, useRef, useEffect } from "react";
import "../style/chatbot.css";
import { robotImg, userImg } from "../utils/imageImports";
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
    // Log when component mounts
    console.log("Chatbot component mounted, setting up socket listeners");
    
    // Setup socket event listener
    socket.on("bot_reply", (msg) => {
      setIsBotTyping(false);

      const botMessage = {
        message: msg,
        sender: "robot",
        id: crypto.randomUUID(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    });

    return () => {
      // Clean up event listener when component unmounts
      console.log("Chatbot component unmounted, cleaning up socket listeners");
      socket.off("bot_reply"); // Cleanup để tránh đăng ký nhiều lần
    };
  }, []);

  const handleSendMessage = () => {
    // Không cho gửi khi đang gõ hoặc khi input rỗng
    if (!inputText.trim() || isBotTyping) return;

    const userMessage = {
      message: inputText,
      sender: "user",
      id: crypto.randomUUID(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
  
    // Thêm dòng "Bot đang nhập..."
    setIsBotTyping(true);
  
    socket.emit("user_message", inputText);
  };

  // Cập nhật sessionStorage mỗi khi chatMessages thay đổi
  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  return (
    <>
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-header" onClick={() => setShowChatbot(false)}>
            <span> 🤖 AI Chatbot</span>
          </div>
          <div className="chat-messages-container" ref={chatMessagesRef}>
            {chatMessages.map(({ message, sender, id }) => (
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
                  {typeof message === "object" ? (
                    <pre>{JSON.stringify(message, null, 2)}</pre> // format object dễ nhìn
                  ) : (
                    message
                  )}
                </div>
                {/* <div className="chat-message-text">
                      {typeof message === "object" ? (
                        <>
                          {message.text && <div>{message.text}</div>}
                          {message.image && (
                            <img
                              src={message.image}
                              alt="bot-media"
                              style={{ maxWidth: "200px", marginTop: "5px", borderRadius: "8px" }}
                            />
                          )}
                          {message.buttons && (
                            <div className="bot-buttons">
                              {message.buttons.map((btn, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => socket.emit("user_message", btn.payload)}
                                  className="bot-button"
                                >
                                  {btn.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        message
                      )}
                    </div>
                    */}

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
