import { useEffect, useMemo } from "react";
import "./App.css";
import OrderBook from "./OrderBook";
import type { Instrument } from "./OrderBook/model/orderBook";
import { createOrderBookProvider } from "./OrderBook/provider/rabbitxOrderBookProvider";
import { Centrifuge } from "centrifuge";

const DEFAULT_INSTRUMENT: Instrument = {
  code: "BTC-USD",
  baseAsset: "BTC",
  currency: "USD",
  precision: 4,
};

const config = {
  wsUrl: process.env.REACT_APP_RABBITX_WS_URL ?? "",
  token: process.env.REACT_APP_RABBITX_API_TOKEN ?? "",
};

function App() {
  const centrifuge = useMemo(
    () =>
      new Centrifuge(config.wsUrl, {
        token: config.token,
      }),
    []
  );

  useEffect(() => {
    centrifuge.connect();
    return () => centrifuge.disconnect();
  }, [centrifuge]);

  const orderBookProvider = useMemo(
    () => createOrderBookProvider(centrifuge),
    [centrifuge]
  );

  if (config.wsUrl !== "" && config.token !== "") {
    return (
      <OrderBook
        orderBookProvider={orderBookProvider}
        instrument={DEFAULT_INSTRUMENT}
      />
    );
  }
  return <div>Error loading application - missing configuration</div>;
}

export default App;
