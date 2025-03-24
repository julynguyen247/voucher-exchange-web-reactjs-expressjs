import React from "react";
import { Row, Col, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-between bg-white h-full">
      <hr />
      <div className="p-6">
        <Title level={2} className="text-center">
          Welcome to Vouchers and Giftcards sharing web!
        </Title>
        <Paragraph className="text-center text-gray-600 max-w-xl mx-auto">
          Here, you can discover the latest discount codes from top e-commerce
          platforms or chain of stores like:
        </Paragraph>

        <Row gutter={[24, 24]} justify="center" className="mt-6">
          <Col>
            <img
              src="src/assets/Shopee.jpg"
              alt="Shopee"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="src/assets/Tiki.jpg"
              alt="Tiki"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl "
            />
          </Col>
          <Col>
            <img
              src="src/assets/Lazada.jpg"
              alt="Lazada"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://th.bing.com/th/id/OIP.SC-H8pnu6PY5E6js_eP4HwHaEM?rs=1&pid=ImgDetMain"
              alt="ebay"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://media3.scdn.vn/img3/2019/12_4/q5bS5n.jpg"
              alt="sendo"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://assets.techverse.asia/media/2023/08/28/1693203096_64ec3a98b17a5_SkNDliLLaYWTBbpH7Zp2.webp"
              alt="tiktokshop"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://www.tripfiction.com/wp-content/uploads/2016/08/1920x1080-brands-amazon-logo.jpg"
              alt="amazon"
              className="w-[110px] h-[60px] object-contain border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://cdn.haitrieu.com/wp-content/uploads/2022/03/Logo-HighLands-Coffee.png"
              alt="highland"
              className="w-[110px] h-[60px] object-contain border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://th.bing.com/th/id/R.0a82cf1174383d6e2597968915d5860b?rik=Q9BakXU%2ff1ejpg&pid=ImgRaw&r=0"
              alt="starbuck"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://th.bing.com/th/id/OIP.JHtrxMXi9uKSgqb0AtKkHwAAAA?rs=1&pid=ImgDetMain"
              alt="phela"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://katinat.vn/wp-content/uploads/2023/12/cropped-Kat-Logo-fa-rgb-05__1_-removebg-preview.png"
              alt="katinat"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
          <Col>
            <img
              src="https://uploads-ssl.webflow.com/5fb85f26f126ce08d792d2d9/639d4fb26949fb0d309d5aba_logo-phuc-long-coffee-and-tea.jpg"
              alt="phuclong"
              className="w-[110px] h-[60px] object-cover border-gray-300 border-1 rounded-2xl"
            />
          </Col>
        </Row>
      </div>
      <hr />
      <div className="text-center my-8">
        <Title level={4}>Still hesitating? Let’s start shopping now!</Title>
        <Paragraph className="text-gray-500">
          Discover hundreds of exclusive deals and vouchers waiting for you.
        </Paragraph>

        <button
          className="bg-green-600 hover:bg-green-700 text-white  rounded  mt-1 text-sm transition p-2"
          onClick={() => navigate("/voucher")}
        >
          Start Shopping
        </button>
      </div>

      <hr />
      <footer className="bg-gray-100 text-center py-6">
        <Text strong>📞 Contact us:</Text>
        <br />
        <Text>Email: contact@voucher.com</Text>
        <br />
        <Text>Hotline: 0123 456 789</Text>
        <br />
        <Text>
          Facebook:{" "}
          <a href="https://facebook.com/voucher" target="_blank">
            fb.com/voucher
          </a>
        </Text>
      </footer>
    </div>
  );
};

export default HomePage;
