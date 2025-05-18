import React, { useState, useEffect } from "react";
import { Button, Typography, message } from "antd";

const { Title, Paragraph, Text } = Typography;

/**
 * MetaMaskWallet component for connecting to MetaMask wallet
 * This component allows users to connect their MetaMask wallet to the application
 */
function MetaMaskWallet({ onWalletConnected }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Effect to check if wallet is already connected
  useEffect(() => {
    checkIfWalletIsConnected();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    // Cleanup listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Get account balance when account changes
  useEffect(() => {
    if (account) {
      getAccountBalance();
    }
  }, [account, chainId]);

  // Check if MetaMask is already connected
  async function checkIfWalletIsConnected() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking if wallet is connected", error);
      }
    }
  }

  // Handle account change
  function handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(null);
      setBalance(null);
    }
  }

  // Handle chain change
  function handleChainChanged(chainId) {
    setChainId(parseInt(chainId, 16));
    // Refresh page on chain change as recommended by MetaMask
    window.location.reload();
  }

  // Connect to MetaMask wallet
  async function connectWallet() {
    if (window.ethereum) {
      try {
        // Request connection to MetaMask
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]); // Set the first wallet address
        message.success("Kết nối ví MetaMask thành công!");
        if (onWalletConnected) onWalletConnected(accounts[0]);
      } catch (error) {
        console.error("User rejected connection", error);
        message.error("Bạn đã từ chối kết nối ví MetaMask.");
      }
    } else {
      message.error("Vui lòng cài đặt MetaMask để sử dụng chức năng này.");
    }
  }

  // Disconnect wallet
  function disconnectWallet() {
    setAccount(null);
    setBalance(null);
    message.info("Đã ngắt kết nối ví MetaMask.");
  }

  // Get wallet balance
  async function getAccountBalance() {
    if (window.ethereum && account) {
      try {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"]
        });
        // Convert balance from Wei to ETH (1 ETH = 10^18 Wei)
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error("Error getting account balance:", error);
      }
    }
  }

  return (
    <div className="py-4">
      <Paragraph className="text-gray-600 text-center mb-6">
        Kết nối ví MetaMask của bạn để thực hiện thanh toán bằng tiền điện tử và tương tác với các dịch vụ blockchain.
      </Paragraph>

      {!account ? (
        <div className="text-center">
          <Button
            type="primary"
            size="large"
            onClick={connectWallet}
            style={{ 
              backgroundColor: "#F6851B", 
              borderColor: "#F6851B", 
              height: "44px",
              fontSize: "16px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              margin: "0 auto"
            }}
          >
            <span style={{ fontSize: '20px', marginRight: '4px' }}>🦊</span> Kết nối với MetaMask
          </Button>
          <Paragraph className="mt-4 text-gray-500 text-sm">
            Bạn cần cài đặt tiện ích mở rộng MetaMask trên trình duyệt của mình
          </Paragraph>
        </div>
      ) : (
        <div className="bg-gray-50 p-5 rounded-lg shadow-inner">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span style={{ fontSize: '24px' }}>🦊</span>
            </div>
            <div>
              <div className="font-medium text-base">MetaMask Connected</div>
              <div className="text-sm text-gray-500">Ethereum Wallet</div>
            </div>
          </div>
          
          <div className="mb-4">
            <Text strong className="flex items-center gap-2">
              <span>Địa chỉ ví:</span>
            </Text>
            <div className="bg-white p-3 rounded border mt-1 break-all text-sm font-mono">
              {account}
            </div>
          </div>
          
          {balance && (
            <div className="mb-4">
              <Text strong>Số dư:</Text>
              <div className="bg-white p-3 rounded border mt-1 flex items-center justify-between">
                <span>{balance} ETH</span>
                <span className="text-gray-500 text-sm">Ethereum Mainnet</span>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button
              danger
              onClick={disconnectWallet}
              size="middle"
              style={{ minWidth: '120px' }}
            >
              Ngắt kết nối
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MetaMaskWallet;
