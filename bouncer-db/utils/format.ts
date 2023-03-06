export const toPercent = (n: number, total: number) => {
  return parseFloat(((n / total) * 100).toFixed(1));
};
