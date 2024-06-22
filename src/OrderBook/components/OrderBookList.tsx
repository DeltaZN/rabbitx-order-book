import { memo } from "react";
import { OrderBook } from "../model/orderBook";
import OrderBookHeader from "./OrderBookHeader/OrderBookHeader";
import OrderBookListItem from "./OrderBookListItem/OrderBookListItem";

interface OrderBookListProps {
  readonly data: OrderBook;
}

function OrderBookList({ data }: OrderBookListProps) {
  return (
    <div>
      <OrderBookHeader />
      {data.asksOrder.map((price) => {
        const priceData = data.asks.get(price);
        if (!priceData) {
          return null;
        }
        return (
          <OrderBookListItem
            // we can use the price as the key since each price level is unique
            key={price}
            type="ask"
            price={price}
            priceData={priceData}
          />
        );
      })}
      <br />
      {data.bidsOrder.map((price) => {
        const priceData = data.bids.get(price);
        if (!priceData) {
          return null;
        }
        return (
        <OrderBookListItem
          // we can use the price as the key since each price level is unique
          key={price}
          type="bid"
          price={price}
          priceData={priceData}
        />
      )})}
    </div>
  );
}

export default memo(OrderBookList);
