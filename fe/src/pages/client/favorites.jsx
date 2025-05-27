import React, { useEffect, useState, useContext } from "react";
import { Button, Rate, message } from "antd";
import { useNavigate } from "react-router-dom";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import dayjs from "dayjs";
import { getFavoritesApi, removeFavoriteApi } from "@/utils/api";
import { AuthContext } from "@/components/context/auth.context";
import { PLATFORM_IMAGES } from "@/utils/imageImports.js";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = auth?.user?.id;
      if (!userId) return;
      try {
        const res = await getFavoritesApi(userId);
        if (res?.data?.data) {
          const vouchers = res.data.data.map((fav) => fav.voucher);
          setFavorites(vouchers);
        }
      } catch (err) {
        console.error("Không thể load danh sách yêu thích", err);
      }
    };

    fetchFavorites();
  }, [auth]);

  const handleRemove = async (voucherId) => {
    const userId = auth?.user?.id;
    try {
      await removeFavoriteApi(userId, voucherId);
      setFavorites((prev) => prev.filter((v) => v._id !== voucherId));
      message.success("Đã xóa khỏi yêu thích");
    } catch (err) {
      message.error("Lỗi khi xóa yêu thích");
    }
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
              className="relative border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all"
            >
              {PLATFORM_IMAGES[item.platform] && (
                <img
                  src={PLATFORM_IMAGES[item.platform]}
                  alt={item.platform}
                  className="w-full h-24 object-contain rounded-md mb-3"
                />
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
                  style={{ text: "black" }}
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
