import { memo, useEffect, useMemo, useState } from "react";
import OrderBookList from "./components/OrderBookList";
import { InstrumentContext } from "./instrumentContext";
import {
  getDefaultOrderBook,
  Instrument,
  type OrderBook,
} from "./model/orderBook";
import { OrderBookProvider } from "./provider/orderBookProvider";

interface OrderBookWidgetProps {
  readonly orderBookProvider: OrderBookProvider;
  readonly instrument: Instrument;
}

function OrderBookWidget({
  orderBookProvider,
  instrument,
}: OrderBookWidgetProps) {
  const [state, setState] = useState<OrderBook>(getDefaultOrderBook);

  useEffect(() => {
    const unsubscribe = orderBookProvider.subscribe(instrument.code, setState);
    return unsubscribe;
  }, [instrument.code, orderBookProvider]);

  const instrumentContext = useMemo(() => ({ instrument }), [instrument]);

  return (
    // use InstrumentContext to avoid props drilling
    <InstrumentContext.Provider value={instrumentContext}>
      <OrderBookList data={state} />
    </InstrumentContext.Provider>
  );
}

export default memo(OrderBookWidget);
