import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../style/chatbot.css"; 
import robotImg from "../assets/robot.png";
import userImg from "../assets/user.png";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

const Chatbot = () => {
  const [isVisible, setIsVisible] = useState(true); // State kiểm soát hiển thị chatbot

  const toggleChatbot = () => {
    setIsVisible((prev) => !prev); // Đảo trạng thái hiển thị
  };

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

    try {
        const response = await axios.post(`${API_URL}/chat`, { message: inputText });
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
    {isVisible && (
      <div className="chatbot-container">
        <div className="chatbot-header" onClick={toggleChatbot}>
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
          />
          <button onClick={handleSendMessage} className="send-button">Gửi</button>
        </div>
      </div>
    )}
  </>
);


};

export default Chatbot;
