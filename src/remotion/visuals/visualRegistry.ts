import React from "react";
import type { VisualType } from "../../content/visuals";
import type { VisualProps } from "./types";
import { OptionContract } from "./OptionContract";
import { Coins, MoneyStack } from "./Coins";
import { PriceLine, StrikeLine, PriceVsStrike } from "./PriceVsStrike";
import { BullCharacter, BearCharacter } from "./Characters";
import {
  Candlestick,
  MiniCandlestickChart,
  FearMeter,
  IVMeter,
} from "./Market";
import {
  RateArrow,
  InflationTag,
  Bond,
  Bank,
  CompanyCard,
  EarningsCard,
} from "./Macro";
import {
  PercentChange,
  BalanceScale,
  MagnifyingGlass,
  Calendar,
  Clock,
  PiggyBank,
  Calculator,
} from "./Objects";
import {
  DollarBubble,
  SpeechBubble,
  Arrow,
  Sparkles,
  Heart,
  Bow,
  QuestionBubble,
} from "./Decor";

export const visualRegistry: Record<VisualType, React.FC<VisualProps>> = {
  money_stack: MoneyStack,
  coins: Coins,
  option_contract: OptionContract,
  price_line: PriceLine,
  strike_line: StrikeLine,
  price_vs_strike: PriceVsStrike,
  bull_character: BullCharacter,
  bear_character: BearCharacter,
  candlestick: Candlestick,
  mini_candlestick_chart: MiniCandlestickChart,
  fear_meter: FearMeter,
  iv_meter: IVMeter,
  rate_arrow: RateArrow,
  inflation_tag: InflationTag,
  bond: Bond,
  bank: Bank,
  company_card: CompanyCard,
  earnings_card: EarningsCard,
  percent_change: PercentChange,
  balance_scale: BalanceScale,
  magnifying_glass: MagnifyingGlass,
  calendar: Calendar,
  clock: Clock,
  piggy_bank: PiggyBank,
  calculator: Calculator,
  dollar_bubble: DollarBubble,
  speech_bubble: SpeechBubble,
  arrow: Arrow,
  sparkles: Sparkles,
  heart: Heart,
  bow: Bow,
  question_bubble: QuestionBubble,
};

export function getVisualComponent(type: VisualType): React.FC<VisualProps> {
  return visualRegistry[type];
}
