import type { CurrencyCode } from "./types";

const tlFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export function money(amount: number, currency: CurrencyCode = "TL") {
  return `${tlFormatter.format(Math.round(amount * 100) / 100)} ${currency}`;
}

export function signedMoney(amount: number, currency: CurrencyCode = "TL") {
  if (amount > 0) return `+${money(amount, currency)}`;
  if (amount < 0) return `-${money(Math.abs(amount), currency)}`;
  return money(0, currency);
}

export function entryTlAmount(amount: number, exchangeRate: number) {
  return Math.round(amount * exchangeRate * 100) / 100;
}
