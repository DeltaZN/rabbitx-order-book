import { Centrifuge } from "centrifuge";
import {
  getDefaultOrderBook,
  newPriceData,
  OrderBook,
  PriceData,
} from "../model/orderBook";
import { OrderBookProvider } from "./orderBookProvider";

// model reference: https://docs.rabbitx.io/api-documentation/data-structure
interface OrderBookTO {
  market_id: string;
  bids: [string, string][];
  asks: [string, string][];
  sequence: number;
  timestamp: number;
}

/**
 * An implementation of OrderBookProvider that uses RabbitX API to get order book updates.
 * Reconnection logic in case of network failure is handled by the centrifuge library.
 *
 * NOTE: This implementation doesn't support multiple subscriptions to the same symbol,
 * because centrifuge doesn't support multiple subscriptions to the same channel.
 * If we want to implement it in future we need to add some kind of cache for order book data.
 */
export function createOrderBookProvider(
  centrifuge: Centrifuge
): OrderBookProvider {
  const subscribe = (
    symbol: string,
    onDataCb: (cb: (prevData: OrderBook) => OrderBook) => void
  ) => {
    const sub = centrifuge.newSubscription(`orderbook:${symbol}`);
    let prevSequence = 0;

    sub.on("publication", (ctx) => {
      if (ctx.data.market_id !== symbol) {
        console.error("Received data for different symbol.");
        return;
      }
      // Each orderbook update increments sequence number by +1.
      // If you have skipped a sequence number, you must resubscribe to get
      // the most accurate orderbook state.
      if (ctx.data.sequence !== prevSequence + 1) {
        console.warn("Sequence mismatch, resubscribe to data source.");
        sub.unsubscribe();
        sub.subscribe();
        return;
      }
      prevSequence = ctx.data.sequence;
      onDataCb((prevData) => processOrderBookUpdate(prevData, ctx.data));
    });

    sub.on("subscribed", (ctx) => {
      if (ctx.data.market_id !== symbol) {
        console.error("Received data for different symbol.");
        return;
      }
      prevSequence = ctx.data.sequence;
      onDataCb(() => processOrderBookUpdate(getDefaultOrderBook(), ctx.data));
    });

    sub.subscribe();

    return () => {
      sub.removeAllListeners();
      sub.unsubscribe();
      centrifuge.removeSubscription(sub);
    };
  };

  return {
    subscribe,
  };
}

function updatePriceDataMap(
  priceDataMap: Map<number, PriceData>,
  priceDataTO: [string, string][]
) {
  for (const [_price, _amount] of priceDataTO) {
    const price = parseFloat(_price);
    const amount = parseFloat(_amount);
    if (amount > 0) {
      const priceData = priceDataMap.get(price) ?? newPriceData(price);
      priceData.amount.next(amount);
      priceDataMap.set(price, priceData);
    } else {
      priceDataMap.delete(price);
    }
  }
}

const array = <T>(iterable: Iterable<T>) => Array.from(iterable);
const sum = (iterable: Iterable<PriceData>) =>
  array(iterable).reduce((acc, val) => acc + val.amount.getValue(), 0);

function processOrderBookUpdate(
  prevData: OrderBook,
  orderBookTO: OrderBookTO
): OrderBook {
  updatePriceDataMap(prevData.bids, orderBookTO.bids);
  updatePriceDataMap(prevData.asks, orderBookTO.asks);

  // bids and asks should be displayed in descending order
  const bidsOrder = array(prevData.bids.keys()).sort((a, b) => b - a);
  const asksOrder = array(prevData.asks.keys()).sort((a, b) => b - a);

  const totalBid = sum(prevData.bids.values());
  const totalAsk = sum(prevData.asks.values());

  let curBidVolume = 0;
  // use regular order to calculate total volume for bids in descending order
  for (const bid of bidsOrder) {
    const priceData = prevData.bids.get(bid);
    if (priceData) {
      curBidVolume += priceData.amount.getValue();
      priceData.total.next(curBidVolume);
      priceData.totalPercent.next((curBidVolume / totalBid) * 100);
    }
  }

  let curAskVolume = 0;
  // iterate in reverse order to calculate total volume for asks in ascending order
  for (let i = asksOrder.length - 1; i >= 0; i--) {
    const ask = asksOrder[i];
    const priceData = prevData.asks.get(ask);
    if (priceData) {
      curAskVolume += priceData.amount.getValue();
      priceData.total.next(curAskVolume);
      priceData.totalPercent.next((curAskVolume / totalAsk) * 100);
    }
  }

  return {
    // NOTE(georgii.savin): don't recreate maps and its values to avoid unnecessary re-renders
    // and manage memory efficiently
    asks: prevData.asks,
    bids: prevData.bids,
    bidsOrder,
    asksOrder,
  };
}
