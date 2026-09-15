/**
 * Canonical educational relationships used by visuals and tests.
 * Never invert these in motion or copy.
 */
export const financeRelationships = {
  sellPutExpiration: {
    favorableWhen: "price_above_strike",
    outcome: "put_expires_worthless_seller_keeps_premium",
  },
  buyCall: {
    favorableWhen: "price_up",
    outcome: "call_gains_value_all_else_equal",
  },
  ratesBonds: {
    ratesUp: "bond_prices_down",
    ratesDown: "bond_prices_up",
  },
} as const;

export function applyPercentChange(value: number, percent: number): number {
  return value * (1 + percent / 100);
}

export function recoverFromLoss(start: number, lossPercent: number): {
  afterLoss: number;
  afterSameGain: number;
  gainNeededPercent: number;
} {
  const afterLoss = applyPercentChange(start, -Math.abs(lossPercent));
  const afterSameGain = applyPercentChange(afterLoss, Math.abs(lossPercent));
  const gainNeededPercent = (start / afterLoss - 1) * 100;
  return { afterLoss, afterSameGain, gainNeededPercent };
}

export function isPriceAboveStrike(price: number, strike: number): boolean {
  return price > strike;
}

export function putSellerWinsAtExpiry(
  spot: number,
  strike: number,
): boolean {
  return spot >= strike;
}
