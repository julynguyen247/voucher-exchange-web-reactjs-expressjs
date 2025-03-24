import { Col, Row, Tabs, Image, Input, Button } from "antd";
import { useEffect, useState } from "react";
import { getVoucher } from "../../utils/api";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import FilterModal from "../../components/client/voucher/filterModal";

const VoucherPage = () => {
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState([]);

  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchVoucher = async () => {
      const res = await getVoucher();
      if (res && res.data.data) {
        setVoucherData(res.data.data);
        setFilteredVouchers(res.data.data);
      }
    };
    fetchVoucher();
  }, []);
  const platformImages = {
    Shopee: "src/assets/Shopee.jpg",
    Lazada: "src/assets/Lazada.jpg",
    Tiki: "src/assets/Tiki.jpg",
    Sendo: "src/assets/Sendo.jpg",
    Ebay: "src/assets/Ebay.jpg",
    Amazon: "src/assets/Amazon.jpg",
    Tiktok: "src/assets/Tiktok.jpg",
  };

  const handleFilterChange = (selectedCategories) => {
    setSelectedCategories(selectedCategories);
    if (selectedCategories.length === 0) {
      setFilteredVouchers(voucherData);
    } else {
      const filtered = voucherData.filter((item) =>
        selectedCategories.includes(item.category)
      );
      setFilteredVouchers(filtered);
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-2">
        <FaArrowLeft
          color="green"
          size={24}
          onClick={() => navigate("/")}
          className="cursor-pointer"
        />
        <Input className="flex-1" placeholder="Tìm kiếm..." />
        <FaFilter
          color="green"
          size={20}
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        />
      </div>

      <Tabs defaultActiveKey="1" centered tabBarGutter={50} />

      <Row gutter={[16, 16]} align="top">
        {filteredVouchers.map((item, index) => (
          <Col span={12} key={index}>
            <div className="h-full border border-gray-400 rounded-2xl p-3 flex flex-col justify-between">
              {platformImages[item.platform] && (
                <Image
                  src={platformImages[item.platform]}
                  preview={false}
                  style={{ borderRadius: "10px", objectFit: "cover" }}
                  width={145}
                  height={80}
                />
              )}

              <div className="text-xs mt-2 flex-1">
                <p className="font-semibold">
                  Giảm {item.discountValue}% đơn tối thiểu {item.minimumOrder}đ
                </p>
                <p className="text-gray-500 text-[11px]">{item.platform}</p>

                <div className="mt-1">
                  <div className="flex items-center gap-1">
                    <RiDiscountPercentLine size={15} />
                    <p className="m-0">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdAccessTime size={15} />
                    <p className="m-0">
                      {dayjs(item.expirationDate).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdAttachMoney size={15} />
                    {item.price === 0 ? (
                      <p className="m-0">Free</p>
                    ) : (
                      <p className="m-0">{item.price}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                block
                size="small"
                className="mt-3 border-black text-black text-xs"
              >
                Buy now
              </Button>
            </div>
          </Col>
        ))}
      </Row>


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
