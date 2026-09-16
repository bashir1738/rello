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
  },
} as const;

export type AssetSymbol = keyof typeof ASSETS;

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
