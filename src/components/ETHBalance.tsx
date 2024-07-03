import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

interface EthBalanceProps {}

const EthBalance: React.FC<EthBalanceProps> = () => {
  const [ethAddress, setEthAddress] = useState("");
  const [ethBalance, setEthBalance] = useState<string | null>(null);

  const [isMetaMaskConnected, setIsMetaMaskConnected] =
    useState<boolean>(false);

  useEffect(() => {
    if (isMetaMaskConnected && ethAddress) {
      fetchEthBalance();
    }
  }, [isMetaMaskConnected, ethAddress]);

  const buttonHandlerMetaMaskConnect = () => {
    if (window.ethereum) {
      if (!isMetaMaskConnected) {
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((res: string[]) => {
            if (res.length > 0) {
              setEthAddress(res[0]);
              setIsMetaMaskConnected(true);
            } else {
              console.error("No address returned from MetaMask.");
            }
          })
          .catch((error: any) => {
            console.error("Error requesting accounts from MetaMask:", error);
          });
      } else {
        disconnectMetaMask();
      }
    } else {
      alert("Metamask extension is not installed.");
    }
  };

  const disconnectMetaMask = () => {
    setIsMetaMaskConnected(false);
    setEthAddress("");
    setEthBalance(null);
  };

  const fetchEthBalance = () => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [ethAddress, "latest"],
      })
      .then((balance: any) => {
        setEthBalance(ethers.utils.formatEther(balance)); // Convert balance to ETH format
      })
      .catch((error: any) => {
        console.error("Error fetching balance from MetaMask:", error);
      });
  };

  return (
    <div className="text-center">
      <button
        onClick={buttonHandlerMetaMaskConnect}
        className={`mb-2 px-4 py-2 rounded-md ${
          isMetaMaskConnected ? "bg-red-500" : "bg-blue-200"
        } text-white`}
      >
        {isMetaMaskConnected ? "Disconnect MetaMask" : "Connect to MetaMask"}
      </button>
      {isMetaMaskConnected && (
        <p className="text-sm text-gray-600">
          <label>ETH Address : {ethAddress}</label>
        </p>
      )}
      {ethBalance !== null && (
        <p className="text-sm text-gray-600">ETH Balance: {ethBalance} ETH </p>
      )}
    </div>
  );
};

export default EthBalance;
