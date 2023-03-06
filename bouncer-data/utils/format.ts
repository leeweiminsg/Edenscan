import { BN } from "bn.js";

export const toPercent = (n: number, total: number) => {
  return parseFloat(((n / total) * 100).toFixed(1));
};

export const strip0x = (hex: string): string => {
  return hex.slice(2, hex.length);
};

export const hexToInt = (hex: string): string => {
  const bn = new BN(hex, 16);

  return bn.toString();
};
