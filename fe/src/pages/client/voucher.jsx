import { useEffect, useState, useContext } from "react";
import {
  getVoucher,
  addToFavoriteApi,
  getFavoritesApi,
  removeFavoriteApi,
} from "../../utils/api.js";
import { FaArrowLeft, FaFilter, FaHeart, FaRegHeart } from "react-icons/fa";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import { Button, Pagination, Rate, message } from "antd";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import FilterModal from "../../components/client/voucher/filterModal.jsx";
import { AuthContext } from "../../components/context/auth.context.jsx";
import queryString from "query-string";
import { Helmet } from "react-helmet-async";
import { PLATFORM_IMAGES } from "../../utils/imageImports.js";

const VoucherPage = () => {
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { auth } = useContext(AuthContext);
  const itemsPerPage = 8;
  const { search } = useLocation();
  const query = queryString.parse(search);
  const searchTerm = (query.search || "").toLowerCase();

  useEffect(() => {
    const fetchVoucher = async () => {
      const res = await getVoucher();
      if (res?.data?.data) {
        const allVouchers = Array.isArray(res.data.data.vouchers)
          ? res.data.data.vouchers
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setVoucherData(allVouchers);

        const filtered = searchTerm
          ? allVouchers.filter(
              (item) =>
                item.category?.toLowerCase().includes(searchTerm) ||
                item.platform?.toLowerCase().includes(searchTerm) ||
                item.code?.toLowerCase().includes(searchTerm)
            )
          : allVouchers;

        setFilteredVouchers(filtered);
      }
    };

    const fetchFavorites = async () => {
      const userId = auth?.user?.id;
      if (!userId) return;
      try {
        const res = await getFavoritesApi(userId);
        const favIds = res.data.data.map((f) => f.voucher._id);
        setFavoriteIds(favIds);
      } catch (err) {
        console.error("Không thể load favorites", err);
      }
    };

    fetchVoucher();
    fetchFavorites();
  }, [auth, searchTerm]);

  const handleFilterChange = (selected) => {
    setSelectedCategories(selected);
    const filtered =
      selected.length === 0
        ? voucherData
        : voucherData.filter((item) => selected.includes(item.category));
    setFilteredVouchers(filtered);
    setCurrentPage(1);
  };

  const toggleFavorite = async (voucherId) => {
    const userId = auth?.user?.id;
    if (!userId) {
      message.error("Bạn cần đăng nhập để yêu thích.");
      return;
    }

    const isFavorited = favoriteIds.includes(voucherId);

    try {
      if (isFavorited) {
        await removeFavoriteApi(userId, voucherId);
        setFavoriteIds((prev) => prev.filter((id) => id !== voucherId));
        message.success("Đã xoá khỏi yêu thích!");
      } else {
        await addToFavoriteApi(userId, voucherId);
        setFavoriteIds((prev) => [...prev, voucherId]);
        message.success("Đã thêm vào yêu thích!");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xử lý yêu thích");
    }
  };

  const paginatedVouchers = Array.isArray(filteredVouchers)
    ? filteredVouchers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mua Bán Voucher Trực Tuyến",
    itemListElement: paginatedVouchers.map((v, index) => ({
      "@type": "Offer",
      position: index + 1,
      itemOffered: {
        "@type": "Product",
        name: `Voucher ${v.platform}`,
        category: v.category,
      },
      price: v.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      validThrough: v.expirationDate,
    })),
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Helmet>
        <title>
          Mua Bán Voucher Uy Tín | Giảm Giá Shopee, Tiki, Lazada - Siêu Voucher
        </title>
        <meta
          name="description"
          content="Siêu Voucher - Nền tảng mua bán voucher giảm giá uy tín. Mã giảm giá Shopee, Tiki, Lazada, Amazon... Giúp bạn tiết kiệm chi phí và mua sắm thông minh hơn mỗi ngày."
        />
        <meta
          name="keywords"
          content="voucher, mã giảm giá, mua bán voucher, voucher Shopee, Tiki, Lazada, mã khuyến mãi, siêu voucher"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="Mua Bán Voucher Online - Siêu Giảm Giá Mỗi Ngày"
        />
        <meta
          property="og:description"
          content="Hàng ngàn voucher từ Shopee, Tiki, Lazada... giúp bạn mua sắm tiết kiệm hơn."
        />
        <meta property="og:url" content="https://sieuvoucher.id.vn/voucher" />
        <meta
          property="og:image"
          content="https://sieuvoucher.id.vn/og-image.jpg"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Siêu Voucher - Mua Bán Mã Giảm Giá"
        />
        <meta
          name="twitter:description"
          content="Nền tảng mua bán voucher trực tuyến uy tín và tiết kiệm chi phí."
        />
        <meta
          name="twitter:image"
          content="https://sieuvoucher.id.vn/og-image.jpg"
        />
        <link rel="canonical" href="https://sieuvoucher.id.vn/voucher" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer text-blue-600"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft size={20} />
          <span className="font-medium">Quay lại Trang chủ</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-700">
          Mua Bán Voucher Online - Ưu Đãi Hấp Dẫn Mỗi Ngày
        </h1>
        <FaFilter
          color="#3685f9"
          size={22}
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedVouchers.map((item) => (
          <div
            key={item._id}
            className="relative border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all"
          >
            <div
              className="absolute top-2 right-2 cursor-pointer z-10"
              onClick={() => toggleFavorite(item._id)}
            >
              {favoriteIds.includes(item._id) ? (
                <FaHeart size={18} className="text-red-500" />
              ) : (
                <FaRegHeart
                  size={18}
                  className="text-gray-400 hover:text-red-400"
                />
              )}
            </div>

            {PLATFORM_IMAGES[item.platform] && (
              <img
                src={PLATFORM_IMAGES[item.platform]}
                alt={`Mã giảm giá ${item.platform} - ${item.category}`}
                className="w-full h-24 object-contain rounded-md mb-3"
                loading="lazy"
              />
            )}

            <div className="text-sm flex-1">
              <p className="font-semibold mb-1">
                Giảm {item.discountValue}% đơn tối thiểu {item.minimumOrder}đ
              </p>
              <p className="text-gray-500 text-xs mb-2">{item.platform}</p>

              <div className="mb-2">
                <Rate disabled allowHalf defaultValue={item.rating || 0} />
                <span className="text-xs text-gray-500 ml-2">
                  ({item.rating || 0}/5)
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <RiDiscountPercentLine size={14} />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MdAccessTime size={14} />
                  <span>{dayjs(item.expirationDate).format("DD/MM/YYYY")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MdAttachMoney size={14} />
                  <span>{item.price === 0 ? "Free" : `${item.price}đ`}</span>
                </div>
              </div>
            </div>

            <Button
              block
              size="small"
              className="mt-4 border-black text-black text-xs"
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
              Mua voucher
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={Array.isArray(filteredVouchers) ? filteredVouchers.length : 0}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <footer className="mt-12 bg-blue-50 rounded-2xl p-6 shadow-inner text-center">
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Nền tảng <strong>mua bán voucher</strong> uy tín với hàng ngàn{" "}
          <strong>mã giảm giá</strong> hấp dẫn từ Shopee, Lazada, Tiki,
          Amazon,... Cập nhật mỗi ngày, giúp bạn{" "}
          <strong>tiết kiệm chi phí</strong> và mua sắm thông minh hơn.
        </p>
      </footer>

      <FilterModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedCategories={selectedCategories}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default VoucherPage;
