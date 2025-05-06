import React from "react";
import { Typography, Carousel, Card } from "antd";
import { useNavigate } from "react-router-dom";
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

const HOT_VOUCHERS = [
  {
    brand: "Shopee",
    title: "Giảm 50K cho đơn từ 250K",
    description: "Áp dụng cho khách hàng mới, số lượng có hạn",
  },
  {
    brand: "Tiki",
    title: "Mã giảm 100K cho sách ngoại văn",
    description: "Chỉ áp dụng trong hôm nay",
  },
  {
    brand: "Lazada",
    title: "Freeship toàn quốc đơn từ 99K",
    description: "Không giới hạn số lần sử dụng",
  },
  {
    brand: "Highlands",
    title: "Tặng 1 ly khi mua combo 2 ly",
    description: "Áp dụng khung giờ 14h - 17h hàng ngày",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen py-6 px-6 sm:px-8 md:px-12 ">
      <div className=" max-w-xl lg:max-w-7xl mx-auto">
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
                className="w-full lg:h-[700px] object-fit"
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
          Tại đây bạn có thể khám phá hàng loạt mã khuyến mãi và ưu đãi độc
          quyền từ các nền tảng thương mại điện tử, cửa hàng cà phê và thương
          hiệu yêu thích.
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
                className="w-full h-[60px]  rounded-xl border border-gray-200 object-cover"
              />
              <p className="text-center text-sm text-gray-700 mt-3 font-medium">
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-md py-24 px-10">
        <div className="max-w-7xl mx-auto">
          <Title level={4} className="text-center text-gray-800 mb-16">
            🎉 Voucher nổi bật hôm nay
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOT_VOUCHERS.map((voucher, index) => (
              <Card
                key={index}
                title={voucher.brand}
                className="rounded-xl shadow hover:shadow-lg transition"
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
                <p className="font-medium text-gray-800">{voucher.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {voucher.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden py-16 px-6 sm:px-12 rounded-xl shadow-xl max-w-5xl mx-auto  from-green-50 to-white">
        <div className="relative z-10 text-center">
          <Title level={3} className="text-green-700 mb-4">
            Sẵn sàng săn deal cực hot?
          </Title>
          <Paragraph className="text-gray-600 text-base max-w-xl mx-auto mb-6">
            Hàng trăm ưu đãi độc quyền từ Shopee, Tiki, Lazada và hơn thế nữa
            đang chờ bạn.
          </Paragraph>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-sm font-semibold rounded-full shadow-md transition"
            onClick={() => navigate("/voucher")}
          >
            Khám phá ngay
          </button>
        </div>

        <div className="absolute -bottom-4 -right-4 opacity-10 w-52 h-52 bg-[url('/assets/deal-icon.png')] bg-no-repeat bg-contain"></div>
      </div>

      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-700 rounded-xl shadow-inner mt-20">
        <p className="font-semibold mb-1">📞 Liên hệ với chúng tôi</p>
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
      </footer>
    </div>
  );
};

export default HomePage;
