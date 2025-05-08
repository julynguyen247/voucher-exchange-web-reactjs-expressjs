import React, { useEffect, useState } from "react";
import { Button, Rate, message } from "antd";
import { useNavigate } from "react-router-dom";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import dayjs from "dayjs";

const platformImages = {
  Shopee: "src/assets/Shopee.jpg",
  Lazada: "src/assets/Lazada.jpg",
  Tiki: "src/assets/Tiki.jpg",
  Sendo: "src/assets/Sendo.jpg",
  Ebay: "src/assets/Ebay.jpg",
  Amazon: "src/assets/Amazon.jpg",
  Tiktok: "src/assets/Tiktok.jpg",
};

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  // Dummy data
  useEffect(() => {
    setFavorites([
      {
        _id: "1",
        discountValue: 50,
        minimumOrder: 100000,
        platform: "Shopee",
        category: "Thời trang",
        rating: 4.7,
        expirationDate: "2025-12-31",
        price: 0,
      },
      {
        _id: "2",
        discountValue: 30,
        minimumOrder: 200000,
        platform: "Tiki",
        category: "Sức khỏe",
        rating: 4.2,
        expirationDate: "2025-10-15",
        price: 10000,
      },
    ]);
  }, []);

  const handleRemove = (id) => {
    setFavorites((prev) => prev.filter((v) => v._id !== id));
    message.success("Đã xóa khỏi yêu thích");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">
        ❤️ Yêu thích của bạn
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center text-gray-500 italic">
          Bạn chưa có voucher nào trong danh sách yêu thích.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div
              key={item._id}
              className={`relative border rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all ${
                item.rating >= 4.5
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300"
              }`}
            >
              {platformImages[item.platform] && (
                <img
                  src={platformImages[item.platform]}
                  alt={item.platform}
                  className="w-full h-24 object-contain rounded-md mb-3"
                />
              )}

              {item.rating >= 4.5 && (
                <span className="text-xs text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded-full absolute top-2 right-2">
                  ⭐ Hot
                </span>
              )}

              <div className="text-sm flex-1">
                <p className="font-semibold mb-1">
                  Giảm {item.discountValue}% đơn tối thiểu{" "}
                  {item.minimumOrder.toLocaleString()}đ
                </p>
                <p className="text-gray-500 text-xs mb-2">{item.platform}</p>

                <div className="mb-2">
                  <Rate disabled allowHalf defaultValue={item.rating || 0} />
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.rating || 0}/5)
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <RiDiscountPercentLine size={14} />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdAccessTime size={14} />
                    <span>
                      {dayjs(item.expirationDate).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdAttachMoney size={14} />
                    <span>
                      {item.price === 0
                        ? "Free"
                        : `${item.price.toLocaleString()}đ`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  block
                  size="small"
                  className="bg-[#3685f9] text-white hover:bg-blue-600 border-none text-xs"
                  onClick={() =>
                    navigate("/order", {
                      state: {
                        voucherId: item._id,
                        voucherName: `Giảm ${item.discountValue}% đơn tối thiểu ${item.minimumOrder}đ`,
                        price: item.price,
                      },
                    })
                  }
                >
                  Mua ngay
                </Button>
                <Button
                  block
                  size="small"
                  danger
                  className="text-xs"
                  onClick={() => handleRemove(item._id)}
                >
                  Bỏ thích
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
