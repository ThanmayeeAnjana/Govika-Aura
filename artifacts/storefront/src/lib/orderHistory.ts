const STORAGE_KEY = "moms_storefront_order_history";

export function getOrderHistoryIds(): number[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const ids = JSON.parse(stored);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(orderId: number): void {
  try {
    const ids = getOrderHistoryIds();
    const next = [orderId, ...ids.filter((id) => id !== orderId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable, ignore
  }
}
