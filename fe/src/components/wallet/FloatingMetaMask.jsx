import React, { useState } from "react";
import { Button, Modal } from "antd";
import MetaMaskWallet from "./MetaMaskWallet";

/**
 * Component hiển thị nút MetaMask nổi và modal kết nối ví
 */
const FloatingMetaMask = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={showModal}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "80px",
          padding: "10px 12px",
          borderRadius: "50%",
          backgroundColor: "#F6851B", // Màu cam chính thức của MetaMask
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          transition: "all 0.3s ease",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(246, 133, 27, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "44px",
          height: "44px",
          transform: "translateY(0)",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#E2761B";
          e.target.style.transform = "translateY(-3px)";
          e.target.style.boxShadow = "0 6px 16px rgba(246, 133, 27, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#F6851B";
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(246, 133, 27, 0.5)";
        }}
        title="Kết nối ví MetaMask"
      >
        🦊
      </button>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🦊</span>
          <span>Kết nối Ví MetaMask</span>
        </div>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        maskClosable={false}
        destroyOnClose
      >
        <MetaMaskWallet onWalletConnected={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default FloatingMetaMask;
