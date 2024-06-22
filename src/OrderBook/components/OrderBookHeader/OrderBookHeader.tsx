import React, { memo, useContext } from "react";
import { InstrumentContext } from "../../instrumentContext";

import "./orderBookHeader.css";

function OrderBookHeader(): React.ReactElement {
  const { instrument } = useContext(InstrumentContext);
  return (
    <div className="order-book__header">
      <span className="order-book__header__price-col">
        Price <ColAsset asset={instrument.currency} />
      </span>
      <span className="order-book__header__amount-col">
        Amount <ColAsset asset={instrument.baseAsset} />
      </span>
      <span className="order-book__header__total-col">
        Total <ColAsset asset={instrument.baseAsset} />
      </span>
    </div>
  );
}

function ColAsset({ asset }: { asset: string }) {
  return <span className="small-text-normal-weight">{asset}</span>;
}

export default memo(OrderBookHeader);
