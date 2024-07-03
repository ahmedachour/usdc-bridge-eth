import React, { useState, useEffect } from "react";
import { StargateClient } from "@cosmjs/stargate";

interface NobleBalanceProps {}

const NobleBalance: React.FC<NobleBalanceProps> = () => {
  const [nobleAddress, setNobleAddress] = useState("");
  const [nobleBalance, setNobleBalance] = useState<string>("");
  const [connected, setConnected] = useState(false);

  const chainId = "noble-1";
  const token = "uusdc";
  const exponent = 1e6;
  const rpcTestnet = process.env.REACT_APP_RPC_URL || "";

  useEffect(() => {
    if (connected && nobleAddress) {
      fetchNobleBalance();
    }
  }, [connected, nobleAddress]);

  const fetchNobleBalance = async () => {
    const offlineSigner = await window.getOfflineSigner(chainId);

    const rpcEndpoint = {
      url: rpcTestnet,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };

    const client = await StargateClient.connect(rpcEndpoint, offlineSigner);
    const balanceAsCoin = await client.getBalance(nobleAddress, token);
    const balance = parseInt(balanceAsCoin.amount) / exponent;
    setNobleBalance(balance.toString());
  };

  const buttonHandlerKeplrConnect = async () => {
    if (window.keplr) {
      try {
        if (!connected) {
          await window.keplr.enable(chainId);

          const offlineSigner = await window.getOfflineSigner(chainId);
          const keplrAccounts = await offlineSigner.getAccounts();

          setNobleAddress(keplrAccounts[0].address);
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error connecting to Keplr:", error);
        alert("Failed to connect to Keplr.");
      }
    } else {
      alert("Keplr extension is not installed.");
    }
  };

  return (
    <div className="text-center">
      <button
        data-testid="keplr-button"
        onClick={buttonHandlerKeplrConnect}
        className={`mb-2 px-4 py-2 rounded-md ${
          connected ? "bg-red-500" : "bg-blue-200"
        } text-white`}
      >
        {connected ? "Disconnect from Keplr" : "Connect to Keplr"}
      </button>

      {connected && (
        <p className="text-sm text-gray-600">Noble Address: {nobleAddress}</p>
      )}
      {connected && (
        <p className="text-sm text-gray-600">
          Noble Balance: {nobleBalance.length > 0 ? nobleBalance : "0"}
        </p>
      )}
    </div>
  );
};

export default NobleBalance;
