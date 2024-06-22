import { newSubject, Subject } from "../../observable/subject";

// each PriceData object represents a price level row in the order book
export interface PriceData {
  price: number; // price level
  // use Subjects in order to optimize updates using useDirectDomUpdate
  amount: Subject<number>; // amount column value
  total: Subject<number>; // total column value
  totalPercent: Subject<number>; // used to display the background volume bar
}

export interface OrderBook {
  // JS map doesn't support sorted order, so we need to store order separately
  bidsOrder: number[];
  bids: Map<number, PriceData>;
  asksOrder: number[];
  asks: Map<number, PriceData>;
}

export interface Instrument {
  code: string; // e.g. "BTC-USD"
  baseAsset: string; // e.g. "BTC"
  currency: string; // e.g. "USD"
  precision: number; // e.g. 4
}

export function getDefaultOrderBook(): OrderBook {
  return {
    bids: new Map(),
    asks: new Map(),
    asksOrder: [],
    bidsOrder: [],
  };
}

export function newPriceData(price: number): PriceData {
  return {
    price,
    amount: newSubject(0),
    total: newSubject(0),
    totalPercent: newSubject(0),
  };
}
