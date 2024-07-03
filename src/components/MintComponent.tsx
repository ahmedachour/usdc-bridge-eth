import React, { useState } from "react";
import {
  DirectSecp256k1HdWallet,
  Registry,
  GeneratedType,
} from "@cosmjs/proto-signing";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { MsgReceiveMessage } from "./generated/tx";
import { Buffer } from "buffer";
import { mintUSDC } from "../utils/api";
import { AttestationStatus } from "../utils/utils";

window.Buffer = Buffer;

const cctpTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/circle.cctp.v1.MsgReceiveMessage", MsgReceiveMessage],
];

function createDefaultRegistry(): Registry {
  return new Registry(cctpTypes);
}

interface MinComponentProps {
  transactionHash: string;
  attestationStatus: AttestationStatus | string;
  amount: string;
}

const MintComponent: React.FC<MinComponentProps> = ({
  transactionHash,
  attestationStatus,
  amount,
}) => {
  const [attestation, setAttestation] = useState<string | null>(null);

  const sourceDomain = process.env.REACT_APP_SOURCE_DOMAIN_ID || "";
  const rpcTestnet = process.env.REACT_APP_RPC_URL || "";
  const from = process.env.REACT_APP_SENDER_ADDRESS || "";
  const mnemonic = process.env.REACT_APP_MNEMONIC || "";
  const denom = "uusdc";
  const gasFees = "990000";

  const handleMint = async () => {
    if (transactionHash && attestationStatus) {
      try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
          prefix: "noble",
        });
        const client = await SigningStargateClient.connectWithSigner(
          rpcTestnet,
          wallet,
          {
            registry: createDefaultRegistry(),
          }
        );

        const balance = await client.getBalance(from, denom);

        if (!balance || balance.amount === "0") {
          alert("Insufficient funds. Please fund your account using a faucet.");
          return;
        }

        const messages = await mintUSDC(transactionHash, sourceDomain);
        const messageHex = messages.message;
        const attestationSignature = messages.attestation;
        setAttestation(attestationSignature);
        const messageBytes = new Uint8Array(
          Buffer.from(messageHex.replace("0x", ""), "hex")
        );
        const attestationBytes = new Uint8Array(
          Buffer.from(attestationSignature.replace("0x", ""), "hex")
        );

        const msg = {
          typeUrl: "/circle.cctp.v1.MsgReceiveMessage",
          value: {
            from: from,
            message: messageBytes,
            attestation: attestationBytes,
          },
        };

        const fee: StdFee = {
          amount: [
            {
              denom: denom,
              amount: amount,
            },
          ],
          gas: gasFees,
        };

        const memo = "";
        const result = await client.signAndBroadcast(from, [msg], fee, memo);

        alert(
          `Minted on Noble: https://mintscan.io/noble-testnet/tx/${result.transactionHash}`
        );
      } catch (error) {
        console.error("Error minting USDC:", error);
        alert("Failed to mint USDC.");
      }
    } else {
      alert("Burn USDC first");
    }
  };

  return (
    <div className="flex flex-col items-center w-1/2">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 w-full h-96 flex flex-col items-center justify-between">
        <h2 className="text-lg mb-4 font-bold">Mint USDC to Ethereum</h2>
        <input
          type="text"
          placeholder="Burn Transaction Hash"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
          value={transactionHash}
          disabled={true}
        />
        <input
          type="text"
          placeholder="Attestation Status"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
          value={attestationStatus}
          disabled={true}
        />
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md mb-4 ${
            attestation ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleMint}
          disabled={false}
        >
          Mint
        </button>
      </div>
    </div>
  );
};

export default MintComponent;
