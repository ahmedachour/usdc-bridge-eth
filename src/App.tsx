import React, { useState } from "react";
import BurnComponent from "./components/BurnComponent";
import MintComponent from "./components/MintComponent";
import { AttestationStatus } from "./utils/utils";
import EthBalance from "./components/ETHBalance";
import NobleBalance from "./components/NobleBalance";

const App: React.FC = () => {
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [attestationStatus, setAttestationStatus] = useState<
    AttestationStatus | string
  >("");

  const handleBurnComplete = (
    hash: string,
    attestationStatus: AttestationStatus,
    amount: string
  ) => {
    setTransactionHash(hash);
    setAttestationStatus(attestationStatus);
    setAmount(amount)
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <header className="w-full max-w-screen-lg text-center mb-10">
        <div className="container mx-auto flex justify-between items-center py-4">
          <NobleBalance> </NobleBalance>
          <EthBalance> </EthBalance>
        </div>
        <h1 className="text-2xl mb-10 font-bold">
          Bridge USDC from Noble to Ethereum
        </h1>
        <div className="flex justify-center gap-4">
          <BurnComponent
            onBurnComplete={handleBurnComplete} 
          />
          <MintComponent
            transactionHash={transactionHash || ""}
            attestationStatus={attestationStatus}
            amount={amount}
          />
        </div>
      </header>
    </div>
  );
};

export default App;
