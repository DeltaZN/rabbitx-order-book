import React from "react";
import { Instrument } from "./model/orderBook";

export interface TInstrumentContext {
    instrument: Instrument;
}

export const InstrumentContext = React.createContext<TInstrumentContext>({
    instrument: {
        code: "MOCK",
        baseAsset: "MOCK",
        currency: "MOCK",
        precision: 4,
    }
});