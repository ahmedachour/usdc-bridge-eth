interface Window {
  ethereum: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  keplr?: {
    experimentalSuggestChain: (args: {
      chainInfo: { chainId: string; rpc: string[] };
    }) => Promise<void>;
    enable: (chainId) => Promise<void>;
  };
  getOfflineSigner: (chainId) => Promise<any>;
}
