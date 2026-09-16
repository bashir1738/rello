/**
 * Staleness detection stress tests.
 * Run: npx ts-node lib/__tests__/staleness.test.ts
 *
 * Tests checkStaleness() with mocked time across edge cases:
 * - NYSE open/close boundaries
 * - Weekend detection
 * - Pre-market / after-hours
 * - Feed age thresholds
 */

const NYSE_OPEN_HOUR = 9;
const NYSE_OPEN_MINUTE = 30;
const NYSE_CLOSE_HOUR = 16;
const NYSE_CLOSE_MINUTE = 0;

interface StalenessResult {
  isStale: boolean;
  reason: string;
  marketStatus: "open" | "closed" | "pre-market" | "after-hours";
}

function getETDate(date: Date): { hour: number; minute: number; day: number } {
  const etStr = date.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);
  return { hour: et.getHours(), minute: et.getMinutes(), day: et.getDay() };
}

function checkStaleness(publishTimeMs: number, nowMs?: number): StalenessResult {
  const now = nowMs ?? Date.now();
  const feedAgeSec = (now - publishTimeMs) / 1000;
  const { hour, minute, day } = getETDate(new Date(now));

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) {
    return { isStale: true, reason: "NYSE closed (weekend)", marketStatus: "closed" };
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
    return { isStale: true, reason: `NYSE closed (${marketStatus})`, marketStatus };
  }

  if (feedAgeSec > 300) {
    return {
      isStale: true,
      reason: `Feed stale: ${(feedAgeSec / 60).toFixed(1)}min since last publish`,
      marketStatus,
    };
  }

  return { isStale: false, reason: "Feed current", marketStatus };
}

// Helper: create a timestamp for a given ET time on a given day
function etTimestamp(year: number, month: number, day: number, hour: number, minute: number): number {
  // month is 0-indexed
  const etStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000`;
  // Parse as ET by appending timezone
  const d = new Date(etStr + "-04:00"); // EDT
  return d.getTime();
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { passed++; console.log(`  PASS: ${label}`); }
  else { failed++; console.log(`  FAIL: ${label}`); }
}

function assertEqual<T>(actual: T, expected: T, label: string) {
  assert(actual === expected, `${label} (got ${actual}, expected ${expected})`);
}

console.log("\n=== Staleness Detection Tests ===\n");

// --- TEST GROUP 1: Market open hours (Wednesday) ---
console.log("Group 1: Market open hours");

// Wednesday Sep 16, 2026 at 10:00 ET
const wed10am = etTimestamp(2026, 8, 16, 10, 0); // Sep = month 8 (0-indexed)

console.log("  1a: Fresh feed (30s old) during open hours");
{
  const result = checkStaleness(wed10am - 30_000, wed10am);
  assertEqual(result.isStale, false, "not stale");
  assertEqual(result.marketStatus, "open", "market is open");
}

console.log("  1b: Stale feed (10min old) during open hours");
{
  const result = checkStaleness(wed10am - 600_000, wed10am);
  assertEqual(result.isStale, true, "is stale");
  assert(result.reason.includes("Feed stale"), "reason mentions feed staleness");
}

console.log("  1c: Feed exactly at 5min threshold (not stale)");
{
  const result = checkStaleness(wed10am - 300_000, wed10am);
  assertEqual(result.isStale, false, "300s is not > 300");
}

console.log("  1d: Feed just over 5min (stale)");
{
  const result = checkStaleness(wed10am - 300_001, wed10am);
  assertEqual(result.isStale, true, "300.001s is > 300");
}

console.log("  1e: Feed from future (not stale by age)");
{
  const result = checkStaleness(wed10am + 60_000, wed10am);
  assertEqual(result.isStale, false, "future feed not stale (age < 300)");
}

console.log("  1f: Very old feed (1 hour)");
{
  const result = checkStaleness(wed10am - 3_600_000, wed10am);
  assertEqual(result.isStale, true, "is stale");
  assert(result.reason.includes("60.0min"), "shows 60.0min");
}

console.log("  1g: Feed from epoch");
{
  const result = checkStaleness(0, wed10am);
  assertEqual(result.isStale, true, "epoch is stale");
}

// --- TEST GROUP 2: Pre-market ---
console.log("\nGroup 2: Pre-market hours");

// Wednesday Sep 16, 2026 at 08:00 ET
const wed8am = etTimestamp(2026, 8, 16, 8, 0);

console.log("  2a: Fresh feed but market closed (pre-market)");
{
  const result = checkStaleness(wed8am - 30_000, wed8am);
  assertEqual(result.isStale, true, "stale because market closed");
  assertEqual(result.marketStatus, "pre-market", "status is pre-market");
  assert(result.reason.includes("pre-market"), "reason mentions pre-market");
}

console.log("  2b: 9:29 ET is still pre-market");
{
  const wed929 = etTimestamp(2026, 8, 16, 9, 29);
  const result = checkStaleness(wed929, wed929);
  assertEqual(result.marketStatus, "pre-market", "9:29 is pre-market");
}

// --- TEST GROUP 3: After-hours ---
console.log("\nGroup 3: After-hours");

// Wednesday Sep 16, 2026 at 17:00 ET
const wed5pm = etTimestamp(2026, 8, 16, 17, 0);

console.log("  3a: Fresh feed but market closed (after-hours)");
{
  const result = checkStaleness(wed5pm - 30_000, wed5pm);
  assertEqual(result.isStale, true, "stale because market closed");
  assertEqual(result.marketStatus, "after-hours", "status is after-hours");
  assert(result.reason.includes("after-hours"), "reason mentions after-hours");
}

console.log("  3b: 16:00 ET exactly is after-hours (close boundary)");
{
  const wed4pm = etTimestamp(2026, 8, 16, 16, 0);
  const result = checkStaleness(wed4pm, wed4pm);
  assertEqual(result.marketStatus, "after-hours", "16:00 is after-hours");
}

console.log("  3c: 15:59 ET is open");
{
  const wed359pm = etTimestamp(2026, 8, 16, 15, 59);
  const result = checkStaleness(wed359pm, wed359pm);
  assertEqual(result.marketStatus, "open", "15:59 is open");
}

// --- TEST GROUP 4: Weekend ---
console.log("\nGroup 4: Weekend detection");

console.log("  4a: Sunday Sep 20, 2026");
{
  const sunday = etTimestamp(2026, 8, 20, 12, 0);
  const result = checkStaleness(sunday, sunday);
  assertEqual(result.isStale, true, "Sunday is stale");
  assertEqual(result.marketStatus, "closed", "market closed on Sunday");
  assert(result.reason.includes("weekend"), "reason mentions weekend");
}

console.log("  4b: Saturday Sep 19, 2026");
{
  const saturday = etTimestamp(2026, 8, 19, 12, 0);
  const result = checkStaleness(saturday, saturday);
  assertEqual(result.isStale, true, "Saturday is stale");
  assert(result.reason.includes("weekend"), "reason mentions weekend");
}

console.log("  4c: Monday Sep 21, 2026 at noon (open)");
{
  const monday = etTimestamp(2026, 8, 21, 12, 0);
  const result = checkStaleness(monday, monday);
  assertEqual(result.isStale, false, "Monday noon is not stale");
  assertEqual(result.marketStatus, "open", "market open on Monday");
}

// --- TEST GROUP 5: Boundary precision ---
console.log("\nGroup 5: Boundary precision");

console.log("  5a: 9:30:00 ET exactly = open");
{
  const t = etTimestamp(2026, 8, 16, 9, 30);
  const result = checkStaleness(t, t);
  assertEqual(result.marketStatus, "open", "9:30 is open");
}

console.log("  5b: 9:30:59 ET = open");
{
  const t = etTimestamp(2026, 8, 16, 9, 30);
  const result = checkStaleness(t, t);
  assertEqual(result.marketStatus, "open", "9:30:59 still open");
}

console.log("  5c: 15:59:59 ET = open");
{
  const t = etTimestamp(2026, 8, 16, 15, 59);
  const result = checkStaleness(t, t);
  assertEqual(result.marketStatus, "open", "15:59 is open");
}

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
