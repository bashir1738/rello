export const ASSETS = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    pythFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    pythFeedAddress: "H8DvFbST5RnTfJSE1FVMEA3DF9peLZMXxzMZ784TRMX",
    wrappedTokenMint: "2wNyN1o2Rp9tFaz5mDThbLGDhSE4RbJQoFvHDNnGzA3m",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 50,
    maxTradeAmount: 1000,
    xStockMint: "AAApLx1jEjCgUCDTHcKPoAksQdFevoC3gdSWcMMRoUo",
    ondoMint: "AAPLonSolanaEPjFdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    pythFeedId: "0x691f02a5a34011ec3ca099ca59a7114c39601a5a2bc8b4f04e0cd95f20a25b28",
    pythFeedAddress: "4LcCkTi4dXqS2tXQfBRHmoPemDmvg3PpfFcH6F2KX7Qo",
    wrappedTokenMint: "",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 75,
    maxTradeAmount: 500,
    xStockMint: "",
    ondoMint: "",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    pythFeedId: "0x8996749b31695b3ae6c9928503d0045828d2eb05c5413fc2837e62c0f6cf8447",
    pythFeedAddress: "EBQ4BmFwp7x9vYJU3ijgm2MVP2W3bYMYDQwB5bMjRbJq",
    wrappedTokenMint: "",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 75,
    maxTradeAmount: 500,
    xStockMint: "",
    ondoMint: "",
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    pythFeedId: "0x390116838709ad828d589173b8563047ea6a50e2f74e2e2c0e45cd3a8a60b54d",
    pythFeedAddress: "8Bn8rCkCtFFG7Tb4S8h6t3bX9z4y7u2i1o0pLkJhMnV",
    wrappedTokenMint: "",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 75,
    maxTradeAmount: 500,
    xStockMint: "",
    ondoMint: "",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    pythFeedId: "0x03f8527a5225bc1b3e591510e3e73cbc5c26e61e1e6be77b7e80e3a0ea84cd40",
    pythFeedAddress: "5S4X7dpExkb8VpNF7oYbXmBEYB9b4t4v4s5p3q1r7u9w",
    wrappedTokenMint: "",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 75,
    maxTradeAmount: 500,
    xStockMint: "",
    ondoMint: "",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    pythFeedId: "0xc9b8de9639a146c5ba28bc2408b403e2c2e09e4e5407c838c06e5dc9c8a0f3c4",
    pythFeedAddress: "3V7t4R5B8a3q7z1y6w5t4r3e2w1q0p9o8i7u6y5t4r3",
    wrappedTokenMint: "",
    meteoraPoolAddress: "" as string,
    deviationThresholdBps: 75,
    maxTradeAmount: 500,
    xStockMint: "",
    ondoMint: "",
  },
} as const;

export type AssetSymbol = keyof typeof ASSETS;

export interface PythFeedVariant {
  label: string;
  feedAddress: string;
  feedId: string;
  source: "equity" | "xstock" | "ondo";
}

export const PYTH_FEED_COMPARISON: Record<string, PythFeedVariant[]> = {
  AAPL: [
    {
      label: "Equity (AAPL/USD)",
      feedAddress: "H8DvFbST5RnTfJSE1FVMEA3DF9peLZMXxzMZ784TRMX",
      feedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      source: "equity",
    },
    {
      label: "xStock (AAPLX/USD)",
      feedAddress: "",
      feedId: "0x4141504c58374441706a58334f33353055534400000000000000000000000000",
      source: "xstock",
    },
    {
      label: "Ondo (AAPLON/USD)",
      feedAddress: "",
      feedId: "0x4141504c4f4e534f4c414e4145504a4664643541756671535371654d32714e00",
      source: "ondo",
    },
  ],
};

export const NYSE_OPEN_HOUR = 9;
export const NYSE_OPEN_MINUTE = 30;
export const NYSE_CLOSE_HOUR = 16;
export const NYSE_CLOSE_MINUTE = 0;

export const HEALTH_THRESHOLDS = {
  healthy: 30,
  warning: 60,
} as const;

export const DRIFT_WEIGHTS = {
  magnitude: 0.5,
  duration: 0.3,
  poolDepth: 0.2,
} as const;
