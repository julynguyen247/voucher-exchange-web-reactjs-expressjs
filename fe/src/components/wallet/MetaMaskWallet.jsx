import React, { useState, useEffect } from "react";
import { Button, Typography, message, Spin } from "antd";
import tokenABI from './vou-token-abi.json';

const { Title, Paragraph, Text } = Typography;
const VOU_CONTRACT_ADDRESS = "0x314cD8EAE63594ac72EEDd627795DB59A783927b";

/**
 * MetaMaskWallet component for connecting to MetaMask wallet
 * This component allows users to connect their MetaMask wallet to the application
 */
function MetaMaskWallet({ onWalletConnected }) {
  const [account, setAccount] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [vouBalance, setVouBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loadingVouBalance, setLoadingVouBalance] = useState(false);
  const [tokenName, setTokenName] = useState("VOU");
  const [tokenDecimals, setTokenDecimals] = useState(18);

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
      getEthBalance();
      getVouTokenInfo();
      getVouBalance();
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
      setEthBalance(null);
      setVouBalance(null);
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
    setEthBalance(null);
    setVouBalance(null);
    message.info("Đã ngắt kết nối ví MetaMask.");
  }

  // Get ETH balance
  async function getEthBalance() {
    if (window.ethereum && account) {
      try {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"]
        });
        // Convert balance from Wei to ETH (1 ETH = 10^18 Wei)
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setEthBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error("Error getting ETH balance:", error);
      }
    }
  }
  
  // Get VOU token information
  async function getVouTokenInfo() {
    if (window.ethereum && account) {
      try {
        // Create contract instance
        const params = {
          to: VOU_CONTRACT_ADDRESS,
          from: account,
          data: encodeTokenFunctionCall("decimals", [])
        };
        
        // Get token decimals
        const decimalsHex = await window.ethereum.request({
          method: "eth_call",
          params: [params, "latest"]
        });
        const decimals = parseInt(decimalsHex, 16);
        setTokenDecimals(decimals);
        
        // Get token symbol
        params.data = encodeTokenFunctionCall("symbol", []);
        const symbolData = await window.ethereum.request({
          method: "eth_call",
          params: [params, "latest"]
        });
        // Decode token symbol (simplified)
        const symbolHex = symbolData.slice(130).replace(/^0+|0+$/g, "");
        const symbol = symbolHex ? hexToString(symbolHex) : "VOU";
        setTokenName(symbol);
      } catch (error) {
        console.error("Error getting token info:", error);
      }
    }
  }
  
  // Get VOU token balance
  async function getVouBalance() {
    if (window.ethereum && account) {
      setLoadingVouBalance(true);
      try {
        // Create the contract call parameters
        const params = {
          to: VOU_CONTRACT_ADDRESS,
          from: account,
          data: encodeTokenFunctionCall("balanceOf", [account])
        };
        
        // Call the contract
        const balanceHex = await window.ethereum.request({
          method: "eth_call",
          params: [params, "latest"]
        });
        
        // Convert hex balance to decimal
        const balance = parseInt(balanceHex, 16) / Math.pow(10, tokenDecimals);
        setVouBalance(balance.toFixed(2));
      } catch (error) {
        console.error("Error getting VOU balance:", error);
        setVouBalance("0.00");
      } finally {
        setLoadingVouBalance(false);
      }
    }
  }
  
  // Helper function to encode function calls for the token contract
  function encodeTokenFunctionCall(functionName, params) {
    const functionABI = tokenABI.find(item => item.name === functionName);
    
    if (!functionABI) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }
    
    // Create function signature
    const signature = `${functionName}(${functionABI.inputs.map(input => input.type).join(',')})`;
    const signatureHash = web3FunctionSignatureToHex(signature);
    
    // For simple cases like balanceOf with an address parameter
    if (functionName === 'balanceOf' && params.length === 1) {
      // Pad address to 32 bytes (64 characters)
      return signatureHash + params[0].slice(2).padStart(64, '0');
    }
    
    // For parameter-less functions
    return signatureHash;
  }
  
  // Helper function to convert function signature to hex
  function web3FunctionSignatureToHex(signature) {
    // This is a simplified version - in production use a library like web3.js or ethers.js
    // We're using a fixed hash here for balanceOf function
    const knownHashes = {
      'balanceOf(address)': '0x70a08231',
      'decimals()': '0x313ce567',
      'symbol()': '0x95d89b41'
    };
    
    return knownHashes[signature] || '0x00000000';
  }
  
  // Helper function to convert hex to string
  function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexValue = hex.substr(i, 2);
      const decimal = parseInt(hexValue, 16);
      if (decimal) {
        str += String.fromCharCode(decimal);
      }
    }
    return str;
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
              <div className="text-sm text-gray-500">VOU Token Wallet</div>
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
          
          <div className="mb-4">
            <Text strong>Số dư VOU:</Text>
            <div className="bg-white p-3 rounded border mt-1 flex items-center justify-between">
              {loadingVouBalance ? (
                <Spin size="small" />
              ) : (
                <span>{vouBalance || '0.00'} {tokenName}</span>
              )}
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                VOU Token
              </span>
            </div>
          </div>
          
          {ethBalance && (
            <div className="mb-4">
              <Text strong>Số dư ETH:</Text>
              <div className="bg-white p-3 rounded border mt-1 flex items-center justify-between">
                <span>{ethBalance} ETH</span>
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
