import { useEffect, useState } from "react";
import { Typography, Carousel, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { getVoucher } from "@/utils/api";
import { PLATFORM_IMAGES, BANNERS, BRANDS } from "@/utils/imageImports";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await getVoucher();
        if (res?.data?.data.vouchers) {
          setVouchers(res.data.data.vouchers.slice(0, 4));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <div className="bg-white min-h-screen py-6 px-6 sm:px-8 md:px-12">
      <div className="max-w-xl lg:max-w-7xl mx-auto">
        <Carousel
          autoplay
          autoplaySpeed={4000}
          dots
          className="rounded-xl overflow-hidden shadow-md"
        >
          {BANNERS.map((src, index) => (
            <div key={index}>
              <img
                src={src}
                alt={`Banner ${index + 1}`}
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="text-center mt-12">
        <Title level={2} className="text-green-600 mb-2">
          Chào mừng đến với Vouchers & Mã giảm giá!
        </Title>
        <Paragraph className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
          Khám phá hàng ngàn ưu đãi đặc biệt từ các nền tảng thương mại và
          thương hiệu nổi tiếng mỗi ngày.
        </Paragraph>
      </div>

      <div className="max-w-7xl mx-auto">
        <Title level={4} className="text-center text-gray-800 mb-16">
          Voucher nổi bật hôm nay
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vouchers.map((voucher, index) => (
            <Card
              key={index}
              title={voucher.platform}
              className="rounded-xl shadow hover:shadow-lg transition"
              cover={
                PLATFORM_IMAGES[voucher.platform] && (
                  <img
                    alt={voucher.platform}
                    src={PLATFORM_IMAGES[voucher.platform]}
                    className="h-[160px] object-contain p-4"
                  />
                )
              }
              actions={[
                <button
                  key={`action-${index}`}
                  onClick={() => navigate("/voucher")}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sử dụng ngay →
                </button>,
              ]}
            >
              <p className="text-sm text-gray-500 mt-1">
                {voucher.category} · Giảm {voucher.discountValue}%
              </p>
              <p className="text-lg font-bold mt-2">
                {voucher.price.toLocaleString()} VNĐ
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24">
        <Title level={4} className="text-center text-gray-700 mb-14">
          Thương hiệu nổi bật
        </Title>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="bg-gray-50 p-4 rounded-2xl shadow hover:shadow-md transition hover:-translate-y-1"
              title={brand.name}
            >
              <img
                src={brand.src}
                alt={brand.name}
                className="w-full h-[60px] rounded-xl border border-gray-200 object-cover"
              />
              <p className="text-center text-sm text-gray-700 mt-3 font-medium">
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-md py-24 px-10 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Title level={3} className="mb-6 text-blue-600">
              Không còn phải lo lắng về các đợt khuyến mãi
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              Chúng tôi tự hào mang đến trải nghiệm mua sắm tiết kiệm nhất với
              hệ thống voucher và mã giảm giá luôn cập nhật từ hơn 500+ thương
              hiệu và sàn thương mại điện tử.
            </Paragraph>

            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button
                onClick={() => navigate("/voucher")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-all transform hover:translate-y-[-2px]"
              >
                Khám phá voucher ngay
              </button>
              <button
                onClick={() => navigate("/ranking")}
                className="bg-white hover:bg-gray-100 text-green-600 font-bold py-3 px-8 rounded-lg shadow border border-green-600 transition-all transform hover:translate-y-[-2px]"
              >
                Xem xếp hạng người dùng
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-24 text-center text-gray-500 pb-8">
        <div>
          <p>© 2025 Voucher Exchange. All rights reserved.</p>
          <p className="mt-2">
            Liên hệ:{" "}
            <a
              href="mailto:support@voucher-exchange.com"
              className="text-green-600 hover:underline"
            >
              support@voucher-exchange.com
            </a>
            {" | "}
            <a
              href="https://facebook.com/voucher"
              className="text-green-600 hover:underline"
            >
              fb.com/voucher
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
