import { useEffect, useState } from "react";
import { Typography, Carousel, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { getVoucher } from "../../utils/api";
import shopeeImg from "../../assets/Shopee.jpg";
import tikiImg from "../../assets/Tiki.jpg";
import lazadaImg from "../../assets/Lazada.jpg";
import ebayImg from "../../assets/Ebay.jpg";
import sendoImg from "../../assets/Sendo.jpg";
import tiktokshopImg from "../../assets/Tiktok.jpg";
import amazonImg from "../../assets/Amazon.jpg";
import highlandsImg from "../../assets/Highlands.jpg";
import starbucksImg from "../../assets/Starbucks.jpg";
import phelaImg from "../../assets/Phela.jpg";
import katinatImg from "../../assets/Katinat.jpg";
import phuclongImg from "../../assets/PhucLong.jpg";

const { Title, Paragraph } = Typography;

const BANNERS = [
  "src/assets/banner1.jpg",
  "src/assets/banner2.jpg",
  "src/assets/banner3.jpg",
];

const BRANDS = [
  { name: "Shopee", src: shopeeImg },
  { name: "Tiki", src: tikiImg },
  { name: "Lazada", src: lazadaImg },
  { name: "Ebay", src: ebayImg },
  { name: "Sendo", src: sendoImg },
  { name: "TikTok Shop", src: tiktokshopImg },
  { name: "Amazon", src: amazonImg },
  { name: "Highlands", src: highlandsImg },
  { name: "Starbucks", src: starbucksImg },
  { name: "Phela", src: phelaImg },
  { name: "Katinat", src: katinatImg },
  { name: "Phúc Long", src: phuclongImg },
];
const PLATFORM_IMAGES = {
  Shopee: shopeeImg,
  Tiki: tikiImg,
  Lazada: lazadaImg,
  Ebay: ebayImg,
  Sendo: sendoImg,
  TikTok: tiktokshopImg,
  Amazon: amazonImg,
  Highlands: highlandsImg,
  Starbucks: starbucksImg,
  Phela: phelaImg,
  Katinat: katinatImg,
  "Phúc Long": phuclongImg,
};

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
                alt={`banner-${index}`}
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
        <Title level={4} className="text-center text-gray-700 mb-14">
          Thương hiệu nổi bật
        </Title>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {BRANDS.map((brand, index) => (
            <div
              key={index}
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
          <Title level={4} className="text-center text-gray-800 mb-16">
            Voucher nổi bật hôm nay
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                title={voucher.platform}
                className="rounded-xl shadow hover:shadow-lg transition"
                cover={
                  PLATFORM_IMAGES[voucher.platform] ? (
                    <img
                      alt={voucher.platform}
                      src={PLATFORM_IMAGES[voucher.platform]}
                      className="h-[160px] object-contain p-4"
                    />
                  ) : null
                }
                actions={[
                  <button
                    key="action"
                    onClick={() => navigate("/voucher")}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    Sử dụng ngay →
                  </button>,
                ]}
              >
                <p className="text-sm text-gray-500 mt-1">
                  Giảm {voucher.discountValue?.toLocaleString("vi-VN")}₫ cho đơn
                  từ {voucher.minimumOrder?.toLocaleString("vi-VN")}₫
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden py-20 px-6 sm:px-12 rounded-xl shadow-xl max-w-6xl mx-auto bg-gradient-to-r from-green-50 to-white mt-16">
        <div className="relative z-10 text-center">
          <Title level={3} className="text-green-700 mb-4">
            Săn deal cực hot mỗi ngày!
          </Title>
          <Paragraph className="text-gray-600 text-base max-w-2xl mx-auto mb-6">
            Cập nhật hàng trăm voucher từ các thương hiệu nổi bật như Shopee,
            Tiki, Lazada, Highlands... và tận hưởng ưu đãi mỗi ngày.
          </Paragraph>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 text-base font-semibold rounded-full shadow-md transition"
            onClick={() => navigate("/voucher")}
          >
            Khám phá ngay
          </button>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-10 w-52 h-52 bg-[url('/assets/deal-icon.png')] bg-no-repeat bg-contain"></div>
      </div>

      <footer className="bg-gray-50 text-center py-10 text-sm text-gray-700 mt-16 border-t border-gray-200">
        <div className="max-w-5xl mx-auto space-y-3">
          <p className="font-semibold text-lg">Liên hệ với chúng tôi</p>
          <p>Email: contact@voucher.com</p>
          <p>Hotline: 0123 456 789</p>
          <p>
            Facebook:{" "}
            <a
              href="https://facebook.com/voucher"
              target="_blank"
              rel="noopener noreferrer"
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
