const axios = require("axios");

const activeConnections = new Map();

function setupRasaSocket(io) {
  io.on("connection", (socket) => {
    const clientIp =
      socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
    console.log(`Client connected: ${socket.id} from ${clientIp}`);

    // Add to active connections
    activeConnections.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      ip: clientIp,
    });

    // Log total number of connections
    console.log(`Total active connections: ${activeConnections.size}`);

    socket.on("user_message", async (msg) => {
      console.log(`User message from ${socket.id}:`, msg);

      try {
        console.log("Sending message to RASA:", msg);
        try {
          const rasaRes = await axios.post(
            "http://localhost:5005/webhooks/rest/webhook",
            {
              sender: socket.id,
              message: msg,
            },
            { timeout: 5000 }
          );

          console.log("RASA response:", rasaRes.data);

          // Check if RASA returned any responses
          if (rasaRes.data && rasaRes.data.length > 0) {
            // Process each RASA response
            rasaRes.data.forEach((responseObj) => {
              // Parse and structure voucher data if it contains voucher information
              if (responseObj.text && responseObj.text.includes("Voucher")) {
                const processedResponse = processVoucherData(responseObj.text);
                socket.emit("bot_reply", {
                  ...responseObj,
                  structured_data: processedResponse
                });
              } else {
                // Forward other responses as is
                socket.emit("bot_reply", responseObj);
              }
            });
          } else {
            socket.emit("bot_reply", {
              text: "Tôi không hiểu câu hỏi của bạn. Vui lòng thử lại với câu hỏi khác.",
            });
          }
        } catch (rasaError) {
          console.error(
            "RASA connection error:",
            rasaError.message,
            rasaError.code
          );

          socket.emit("bot_reply", {
            text: "Xin lỗi, dịch vụ chatbot đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
          });
          
          setTimeout(() => {
            socket.emit("bot_reply", {
              text: "Trong khi chờ dịch vụ chatbot phục hồi, bạn có thể tìm hiểu về cách sử dụng voucher hoặc cách tạo tài khoản bằng cách truy cập mục trợ giúp.",
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Socket handling error:", err.message, err.stack);
        socket.emit("bot_reply", {
          text: "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      activeConnections.delete(socket.id);
      console.log(`Remaining active connections: ${activeConnections.size}`);
    });
  });
}

/**
 * Function to process voucher text data into structured format
 */
function processVoucherData(text) {
  // Check if the text contains voucher information
  if (!text.includes("Đây là những voucher bạn muốn tìm:")) {
    return null;
  }

  const vouchers = [];
  // Split the text into individual voucher sections
  const voucherSections = text.split("Voucher ").slice(1);
  
  voucherSections.forEach(section => {
    // Extract voucher number and details
    const numberMatch = section.match(/^(\d+):/);
    if (numberMatch) {
      const voucherNumber = numberMatch[1];
      const voucherDetails = section.substring(numberMatch[0].length).trim();
      
      // Parse the details into a structured object
      const lines = voucherDetails.split("\n").filter(line => line && !line.includes("---------------"));
      const voucher = {
        number: parseInt(voucherNumber)
      };
      
      lines.forEach(line => {
        const [key, value] = line.split(": ");
        if (key && value) {
          const keyLower = key.trim().toLowerCase();
          const valueTrimmed = value.trim();
          
          switch (keyLower) {
            case "nền tảng":
              voucher.platform = valueTrimmed;
              break;
            case "danh mục":
              voucher.category = valueTrimmed;
              break;
            case "giảm giá":
              voucher.discount = valueTrimmed;
              break;
            case "giá":
              voucher.price = valueTrimmed;
              break;
            case "mã":
              voucher.code = valueTrimmed;
              break;
            case "hạn sử dụng":
              voucher.expiration = valueTrimmed;
              break;
            case "đánh giá":
              voucher.rating = valueTrimmed;
              break;
            default:
              // Handle any other fields
              const normalizedKey = keyLower.replace(/\s+/g, "_");
              voucher[normalizedKey] = valueTrimmed;
          }
        }
      });
      
      vouchers.push(voucher);
    }
  });
  
  return { vouchers };
}

module.exports = setupRasaSocket;