import { OrderBook } from "../model/orderBook";

type UnsubscribeFn = () => void;

export interface OrderBookProvider {
    subscribe(symbol: string, onDataCb: (cb: (prevData: OrderBook) => OrderBook) => void): UnsubscribeFn;
}