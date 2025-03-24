import React, { useState } from "react";
import { Modal, Checkbox } from "antd";

const categoryOptions = [
  "Food & Drinks",
  "Fashion & Jewelry",
  "Beauty & Health",
  "Electronics",
  "Home & Living",
  "Travel & Entertainment",
  "Baby & Kids",
];

const FilterModal = ({
  openModal,
  setOpenModal,
  selectedCategories,
  onFilterChange,
}) => {
  const [selected, setSelected] = useState(selectedCategories || []);

  const handleOk = () => {
    onFilterChange(selected);
    setOpenModal(false);
  };

  const handleCancel = () => {
    setSelected(selectedCategories); // Giữ trạng thái trước đó nếu bấm hủy
    setOpenModal(false);
  };

  const handleCheckboxChange = (category) => {
    if (selected.includes(category)) {
      setSelected(selected.filter((item) => item !== category));
    } else {
      setSelected([...selected, category]);
    }
  };

  return (
    <Modal
      title="Filter"
      open={openModal}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="flex flex-col gap-2">
        {categoryOptions.map((category) => (
          <Checkbox
            key={category}
            checked={selected.includes(category)}
            onChange={() => handleCheckboxChange(category)}
          >
            {category}
          </Checkbox>
        ))}
      </div>
    </Modal>
  );
};

export default FilterModal;
