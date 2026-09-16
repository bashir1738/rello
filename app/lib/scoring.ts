import { DRIFT_WEIGHTS, HEALTH_THRESHOLDS } from "./constants";

export interface HealthInput {
  referencePrice: number;
  wrappedPrice: number;
  driftDurationSeconds: number;
  poolDepthUsd: number | null;
}

export interface HealthResult {
  driftPct: number;
  driftBps: number;
  healthScore: number;
  status: "healthy" | "warning" | "critical" | "reference_stale" | "no_data";
}

function normalizeDrift(magnitudePct: number): number {
  const absDrift = Math.abs(magnitudePct);
  if (absDrift <= 0.1) return 0;
  if (absDrift >= 5) return 100;
  return Math.min(100, (absDrift / 5) * 100);
}

function normalizeDuration(durationSec: number): number {
  if (durationSec <= 0) return 0;
  if (durationSec >= 3600) return 100;
  return Math.min(100, (durationSec / 3600) * 100);
}

function normalizePoolDepth(depthUsd: number | null): number {
  if (depthUsd === null || depthUsd <= 0) return 100;
  if (depthUsd >= 100000) return 0;
  return Math.max(0, 100 - (depthUsd / 100000) * 100);
}

export function calculatePegHealth(input: HealthInput): HealthResult {
  const { referencePrice, wrappedPrice, driftDurationSeconds, poolDepthUsd } =
    input;

  if (referencePrice <= 0 || wrappedPrice <= 0) {
    return {
      driftPct: 0,
      driftBps: 0,
      healthScore: 0,
      status: "no_data",
    };
  }

  const driftPct =
    ((wrappedPrice - referencePrice) / referencePrice) * 100;
  const driftBps = Math.round(driftPct * 100);

  const magScore = normalizeDrift(driftPct);
  const durScore = normalizeDuration(driftDurationSeconds);
  const depthScore = normalizePoolDepth(poolDepthUsd);

  const healthScore = Math.round(
    100 -
      (magScore * DRIFT_WEIGHTS.magnitude +
        durScore * DRIFT_WEIGHTS.duration +
        depthScore * DRIFT_WEIGHTS.poolDepth)
  );

  let status: HealthResult["status"];
  if (healthScore >= HEALTH_THRESHOLDS.healthy) {
    status = "healthy";
  } else if (healthScore >= HEALTH_THRESHOLDS.warning) {
    status = "warning";
  } else {
    status = "critical";
  }

  return {
    driftPct: Math.round(driftPct * 100) / 100,
    driftBps,
    healthScore: Math.max(0, Math.min(100, healthScore)),
    status,
  };
}
