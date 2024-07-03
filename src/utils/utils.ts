import { Event } from "@cosmjs/stargate";

import { Buffer } from "buffer";
import { keccak256 } from "ethers/lib/utils";

window.Buffer = Buffer;

export const base64ToBytes = (base64: any) => {
  return Buffer.from(base64, "base64");
};

export const getMessageBytesFromEvents = (
  events: Event[],
  eventType: string
) => {
  const event = events.find((e) => e.type === eventType);

  if (!event) {
    throw new Error(`Event with type ${eventType} not found`);
  }

  const messageAttribute = event.attributes.find(
    (attr: { key: string }) => attr.key === "message"
  );

  if (!messageAttribute) {
    throw new Error(
      `Attribute with key 'message' not found in event ${eventType}`
    );
  }

  return base64ToBytes(messageAttribute.value);
};

export const getMessageHashFromBytes = (message: string) => {
  return keccak256(message);
};

export enum AttestationStatus {
  PENDING_CONFIRMATIONS = "pending_confirmations",
  COMPLETE = "complete",
  FAILED = "failed",
}
