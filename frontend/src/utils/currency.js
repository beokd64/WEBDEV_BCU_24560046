// src/utils/currency.js
export async function getExchangeRate(toCurrency) {
  if (!toCurrency || toCurrency === "USD") return 1;

  try {
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(
        toCurrency
      )}`
    );
    const data = await res.json();
    return data?.rates?.[toCurrency] ?? 1;
  } catch (e) {
    console.error("Exchange rate fetch error:", e);
    return 1;
  }
}

export function formatCurrency(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback if an unsupported code sneaks in
    return `${amount.toFixed(2)} ${currency}`;
  }
}
