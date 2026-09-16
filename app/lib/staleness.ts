import {
  NYSE_OPEN_HOUR,
  NYSE_OPEN_MINUTE,
  NYSE_CLOSE_HOUR,
  NYSE_CLOSE_MINUTE,
} from "./constants";

export interface StalenessResult {
  isStale: boolean;
  reason: string;
  marketStatus: "open" | "closed" | "pre-market" | "after-hours";
}

function getETDate(date: Date): {
  hour: number;
  minute: number;
  day: number;
} {
  const etStr = date.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);
  return {
    hour: et.getHours(),
    minute: et.getMinutes(),
    day: et.getDay(),
  };
}

export function checkStaleness(publishTimeMs: number): StalenessResult {
  const now = Date.now();
  const feedAgeSec = (now - publishTimeMs) / 1000;

  const { hour, minute, day } = getETDate(new Date());

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) {
    return {
      isStale: true,
      reason: "NYSE closed (weekend)",
      marketStatus: "closed",
    };
  }

  const timeMinutes = hour * 60 + minute;
  const openMinutes = NYSE_OPEN_HOUR * 60 + NYSE_OPEN_MINUTE;
  const closeMinutes = NYSE_CLOSE_HOUR * 60 + NYSE_CLOSE_MINUTE;

  let marketStatus: StalenessResult["marketStatus"];
  if (timeMinutes < openMinutes) {
    marketStatus = "pre-market";
  } else if (timeMinutes >= closeMinutes) {
    marketStatus = "after-hours";
  } else {
    marketStatus = "open";
  }

  if (marketStatus !== "open") {
    return {
      isStale: true,
      reason: `NYSE closed (${marketStatus})`,
      marketStatus,
    };
  }

  if (feedAgeSec > 300) {
    return {
      isStale: true,
      reason: `Feed stale: ${(feedAgeSec / 60).toFixed(1)}min since last publish`,
      marketStatus,
    };
  }

  return {
    isStale: false,
    reason: "Feed current",
    marketStatus,
  };
}
