import { expireDueLicenses } from "../services/license.service";

function endOfCurrentMonth(): Date {
  const now = new Date();
  // First day of next month
  const firstNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  // Last ms of current month
  const endOfMonth = new Date(firstNextMonth.getTime() - 1);
  // Run at 23:59:59 local time of the last day
  return new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 23, 59, 59, 0);
}

async function runAndReschedule() {
  try {
    // Mark all due licenses as expired as of now
    await expireDueLicenses(new Date());
    // eslint-disable-next-line no-console
    console.log("[Cron] expireDueLicenses executed successfully");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Cron] expireDueLicenses failed", err);
  } finally {
    scheduleNext();
  }
}

function scheduleNext() {
  const next = endOfCurrentMonth();
  const delay = Math.max(next.getTime() - Date.now(), 1000); // at least 1s
  // eslint-disable-next-line no-console
  console.log(`[Cron] Scheduling monthly expiry at ${next.toString()} (in ${Math.round(delay / 1000)}s)`);
  setTimeout(runAndReschedule, delay);
}

export function scheduleMonthlyExpiry() {
  scheduleNext();
}
