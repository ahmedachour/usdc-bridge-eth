import React, { useState } from "react";
import {
  DirectSecp256k1HdWallet,
  Registry,
  GeneratedType,
} from "@cosmjs/proto-signing";
import { SigningStargateClient, StdFee, Event } from "@cosmjs/stargate";
import { MsgDepositForBurnWithCaller } from "./generated/tx";
import { Buffer } from "buffer";
import { pollAttestationStatus } from "../utils/api";
import {
  getMessageBytesFromEvents,
  getMessageHashFromBytes,
  AttestationStatus
} from "../utils/utils";

window.Buffer = Buffer;

const cctpTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/circle.cctp.v1.MsgDepositForBurn", MsgDepositForBurnWithCaller],
];

export const createDefaultRegistry = (): Registry => {
  return new Registry(cctpTypes);
}

interface BurnComponentProps {
  onBurnComplete: (hash: string, attestationStatus: AttestationStatus, amount: string) => void; // Callback function type
}

const BurnComponent: React.FC<BurnComponentProps> = ({ onBurnComplete }) => {
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [attestation, setAttestation] = useState<string | null>(null);

  const rpcTestnet = process.env.REACT_APP_RPC_URL || "";
  const from = process.env.REACT_APP_SENDER_ADDRESS || "";
  const mnemonic = process.env.REACT_APP_MNEMONIC || "";
  const gasFees = "990000";
  const denom = "uusdc";

  const handleBurn = async () => {
    if (amount && recipientAddress) {
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

        const rawMintRecipient = recipientAddress ? recipientAddress : "";
        const cleanedMintRecipient = rawMintRecipient.replace(/^0x/, "");
        const zeroesNeeded = 64 - cleanedMintRecipient.length;
        const mintRecipient = "0".repeat(zeroesNeeded) + cleanedMintRecipient;
        const buffer = Buffer.from(mintRecipient, "hex");
        const mintRecipientBytes = new Uint8Array(buffer);

        const msg = {
          typeUrl: "/circle.cctp.v1.MsgDepositForBurn",
          value: {
            from: from,
            amount: amount,
            destinationDomain: 0,
            mintRecipient: mintRecipientBytes,
            burnToken: denom,
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

        const messageBytes = getMessageBytesFromEvents(
          result.events as Event[],
          "circle.cctp.v1.MessageSent"
        );
        const messageHash = getMessageHashFromBytes(messageBytes as any);

        const response: any = await pollAttestationStatus(messageHash);
        if (response.status === AttestationStatus.PENDING_CONFIRMATIONS) {
          setAttestation("PENDING");
        } else if (response.status === AttestationStatus.COMPLETE) {
          setAttestation(response.attestation || "No attestation found");
          onBurnComplete(result.transactionHash, response.status, amount);
          console.log(
            `Burned on Noble: https://mintscan.io/noble-testnet/tx/${result.transactionHash}`
          );
          console.log(
            `Minting on Ethereum to https://sepolia.etherscan.io/address/${rawMintRecipient}`
          );
        }
      } catch (error) {
        console.error("Error burning USDC:", error);
        alert("Failed to burn USDC.");
      }
    } else {
      alert("Please put an address and an amout");
    }
  };

  return (
    <div className="flex flex-col items-center w-1/2">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 w-full h-96 flex flex-col items-center justify-between">
        <h2 className="text-lg mb-4 font-bold">Burn USDC to Noble</h2>
        <input
          type="text"
          placeholder="Mint Amount"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!!attestation}
        />
        <input
          type="text"
          placeholder="ETH Recipient Address"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={!!attestation}
        />
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md mb-4 ${
            attestation ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleBurn}
          disabled={!!attestation}
        >
          Burn
        </button>
      </div>
    </div>
  );
};

export default BurnComponent;
