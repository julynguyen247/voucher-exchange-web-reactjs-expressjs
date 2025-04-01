require("dotenv").config();
const express = require("express");

const router = express.Router();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Lỗi: Chưa cấu hình OPENAI_API_KEY trong file .env");
  process.exit(1);
}

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Nội dung tin nhắn không hợp lệ!" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: message }],
        temperature: 0.7, 
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Lỗi khi gọi OpenAI API:", error.response?.data || error.message);

    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        return res.status(401).json({ error: "API Key không hợp lệ hoặc hết hạn!" });
      }
      if (status === 429) {
        return res.status(429).json({ error: "Quá nhiều yêu cầu, hãy thử lại sau!" });
      }
      if (status === 500) {
        return res.status(500).json({ error: "Lỗi máy chủ OpenAI!" });
      }
    }

    res.status(500).json({ error: "Không thể kết nối tới OpenAI API." });
  }
});

module.exports = router;
