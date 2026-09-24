/* Amount financed and fixed-payment amortization. No lender terms are implied. */
function estimateLoan({price, down, trade, tradeOwed, taxFees, apr, months}) {
  const amount = price + taxFees + tradeOwed - down - trade;
  if (amount < 0) return {error: 'negativeAmount'};
  const rate = apr / 1200;
  const monthly = amount === 0 ? 0 : rate === 0 ? amount / months : amount * rate / (1 - Math.pow(1 + rate, -months));
  const total = monthly * months;
  return {amount, monthly, total, interest: Math.max(0, total - amount)};
}
if (typeof module !== 'undefined') module.exports = {estimateLoan};
