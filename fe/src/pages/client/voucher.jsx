import { useEffect, useState } from "react";
import { getVoucher } from "../../utils/api";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import { Input, Button, Pagination, Rate } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import FilterModal from "../../components/client/voucher/filterModal";

const platformImages = {
  Shopee: "src/assets/Shopee.jpg",
  Lazada: "src/assets/Lazada.jpg",
  Tiki: "src/assets/Tiki.jpg",
  Sendo: "src/assets/Sendo.jpg",
  Ebay: "src/assets/Ebay.jpg",
  Amazon: "src/assets/Amazon.jpg",
  Tiktok: "src/assets/Tiktok.jpg",
};

const VoucherPage = () => {
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchVoucher = async () => {
      const res = await getVoucher();
      if (res?.data?.data) {
        setVoucherData(res.data.data);
        setFilteredVouchers(res.data.data);
      }
    };
    fetchVoucher();
  }, []);

  const handleFilterChange = (selected) => {
    setSelectedCategories(selected);
    const filtered =
      selected.length === 0
        ? voucherData
        : voucherData.filter((item) => selected.includes(item.category));
    setFilteredVouchers(filtered);
    setCurrentPage(1);
  };

  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaArrowLeft
            color="#3685f9"
            size={24}
            onClick={() => navigate("/")}
            className="cursor-pointer"
          />
          <Input placeholder="Tìm kiếm..." className="flex-1" size="large" />
        </div>
        <FaFilter
          color="#3685f9"
          size={22}
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedVouchers.map((item, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all"
          >
            {platformImages[item.platform] && (
              <img
                src={platformImages[item.platform]}
                alt={item.platform}
                className="w-full h-24 object-contain rounded-md mb-3"
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
              Buy now
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredVouchers.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
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
