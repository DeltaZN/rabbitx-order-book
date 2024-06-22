import { memo, useContext } from "react";
import { PriceData } from "../../model/orderBook";
import { InstrumentContext } from "../../instrumentContext";
import { useDirectDomUpdate } from "../../../hooks/useDirectDomUpdate";
import { Subject } from "../../../observable/subject";

import "./orderBookListItem.css";

interface OrderBookListItemProps {
  readonly price: number;
  readonly priceData: PriceData;
  readonly type: "ask" | "bid";
}

const priceLevelFormatter = new Intl.NumberFormat("en-US");

const listItemColorClass = {
  ask: "order-book--ask-color",
  bid: "order-book--bid-color",
};

function OrderBookListItem({ price, priceData, type }: OrderBookListItemProps) {
  const amount = useDomRenderedNum(priceData.amount);
  const total = useDomRenderedNum(priceData.total);
  const bgVolume = useDomUpdatedBgColor(priceData.totalPercent, type);

  return (
    <div className={`order-book__list-item ${listItemColorClass[type]}`}>
      <span className="order-book__list-item__price-col">
        {priceLevelFormatter.format(price)}
      </span>
      <span className="order-book__list-item__amount-col">{amount}</span>
      <span className="order-book__list-item__total-col">
        {bgVolume}
        {total}
      </span>
    </div>
  );
}

function useDomRenderedNum(subject: Subject<number>) {
  const { instrument } = useContext(InstrumentContext);
  return useDirectDomUpdate(
    subject,
    (value, el) => (el.textContent = value.toFixed(instrument.precision))
  );
}

const totalBgColorClass = {
  ask: "order-book--ask-volume-bg-color",
  bid: "order-book--bid-volume-bg-color",
};

function useDomUpdatedBgColor(
  widthSubject: Subject<number>,
  type: "ask" | "bid"
) {
  return useDirectDomUpdate(
    widthSubject,
    (width, el) => (el.style.width = `${width.toFixed(width)}%`),
    {
      tagName: "div",
      props: {
        className: `order-book__list-item__total-bg ${totalBgColorClass[type]}`,
      },
    }
  );
}

export default memo(OrderBookListItem);
