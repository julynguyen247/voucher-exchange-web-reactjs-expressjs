import React from "react";
import { Modal, Rate } from "antd";
import dayjs from "dayjs";
import { RiDiscountPercentLine } from "react-icons/ri";
import { MdAccessTime, MdAttachMoney } from "react-icons/md";
import { PLATFORM_IMAGES } from "../../../utils/imageImports";

const VoucherDetailModal = ({ visible, onClose, voucher }) => {
  if (!voucher) return null;
  const voucherImageUrl = `${import.meta.env.VITE_BACKEND_URL}/images/upload/${
    voucher.image
  }`;
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={`Chi tiết voucher ${voucher.code}`}
      centered
    >
      <div className="space-y-3">
        {voucher.image ? (
          <img
            src={voucherImageUrl}
            alt={`Ảnh voucher ${voucher.code}`}
            className="w-full max-h-52 object-contain rounded border mb-2"
          />
        ) : PLATFORM_IMAGES[voucher.platform] ? (
          <img
            src={PLATFORM_IMAGES[voucher.platform]}
            alt={`Logo ${voucher.platform}`}
            className="w-full max-h-32 object-contain rounded border mb-2"
          />
        ) : null}

        <p>
          <strong>Giảm:</strong> {voucher.discountValue}% cho đơn tối thiểu{" "}
          {voucher.minimumOrder}đ
        </p>

        <p>
          <strong>Nền tảng:</strong> {voucher.platform}
        </p>

        <p>
          <strong>Danh mục:</strong>{" "}
          <span className="inline-flex items-center gap-1">
            <RiDiscountPercentLine /> {voucher.category}
          </span>
        </p>

        <p>
          <strong>Hạn sử dụng:</strong>{" "}
          <span className="inline-flex items-center gap-1">
            <MdAccessTime />{" "}
            {dayjs(voucher.expirationDate).format("DD/MM/YYYY")}
          </span>
        </p>

        <p>
          <strong>Giá:</strong>{" "}
          <span className="inline-flex items-center gap-1">
            <MdAttachMoney />{" "}
            {voucher.price === 0 ? "Free" : `${voucher.price}đ`}
          </span>
        </p>

        <p>
          <strong>Đánh giá:</strong>{" "}
          <Rate disabled allowHalf defaultValue={voucher.rating || 0} />
        </p>
      </div>
    </Modal>
  );
};

export default VoucherDetailModal;
