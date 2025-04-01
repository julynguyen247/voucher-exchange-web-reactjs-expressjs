import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../style/chatbot.css"; 
import robotImg from "../assets/robot.png";
import userImg from "../assets/user.png";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

const Chatbot = ({ showChatbot, setShowChatbot }) => {
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { message: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "robot", id: "id1" },
  ]);

  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { message: inputText, sender: "user", id: crypto.randomUUID() };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    const token = localStorage.getItem("token"); 

    if (!token) {
        console.error("🚨 Không tìm thấy token, vui lòng đăng nhập lại!");
        setChatMessages((prevMessages) => [
            ...prevMessages,
            { message: "🚨 Bạn chưa đăng nhập! Hãy đăng nhập để tiếp tục.", sender: "robot", id: crypto.randomUUID() }
        ]);
        return;
    }

    try {
        const response = await axios.post(
            `${API_URL}/v1/api/chatbot`,
            { message: inputText },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const botMessage = { message: response.data.reply, sender: "robot", id: crypto.randomUUID() };

        setChatMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
        console.error("❌ Lỗi khi gửi tin nhắn:", error);
        setChatMessages((prevMessages) => [
            ...prevMessages,
            { message: "Xin lỗi, tôi đang gặp sự cố!", sender: "robot", id: crypto.randomUUID() }
        ]);
    }
  };

  return (
    <>
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-header" onClick={() => setShowChatbot(false)}>
            <span> 🤖 AI Chatbot</span>
          </div>
          <div className="chat-messages-container" ref={chatMessagesRef}>
            {chatMessages.map(({ message, sender, id }) => (
              <div key={id} className={sender === "user" ? "chat-message-user" : "chat-message-robot"}>
                {sender === "robot" && <img src={robotImg} alt="Robot" className="chat-message-profile" />}
                <div className="chat-message-text">{message}</div>
                {sender === "user" && <img src={userImg} alt="User" className="chat-message-profile" />}
              </div>
            ))}
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
            <button onClick={handleSendMessage} className="send-button">Gửi</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
