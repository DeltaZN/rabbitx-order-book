# Order Book Widget

You can see deployed on vercel widget [here](https://rabbitx-order-book.vercel.app/).

## Overview

This project provides an isolated UI order book widget that displays the order book for a given instrument. The order book is updated in real-time using a WebSocket connection.

The widget also manages rendering of the order book efficiently by using a custom hook `useDirectDomUpdate` that updates the DOM without (relatively) expensive React rerender. It is especially useful when we have a lot of frequent updates at the same price levels.

Default (RabbitX) implementation of the order book data provider handles network disruptions and reconnects to data source automatically. However, you can supply your own order book provider by implementing the `OrderBookProvider` interface (at least for mocking data in test scenarios).

## Code Style

The goal of having common code style is to reduce burden on developers when they switch between different areas of the project and they decide how to write the code. 

### File Structure

1. React components are named in PascalCase and are placed under `src/[domain]/components` directory.
2. Use camelCase for files that do not export React components.

## Challenges

1. Instrument info is needed in almost all components of order book, so I have decided to use context to access instrument info to avoid props drilling. Later, we can use some state management library like Redux or MobX to manage the global state, but this detail depends on the parent project.
2. We have to construct and maintain an optimized array of bids and asks array, ensuring efficient memory management. In my practice, managing small amount of elements (<<1000) is not a big deal for UI. However, when it comes to updating these values frequently in React components, it often becomes a bottleneck. To tackle this issue, I brought a custom hook which skips React render cycle - see `src/hooks/useDirectDomUpdate.ts`. The usage of this hook is highly discouraged, because it breaks the React paradigm. However, in this case, it is a necessary evil, which gives huge performance improvement.

## Future Improvements

In all cases described below improvements are likely to depend on the specifics of the parent project, because localization, tests, styling library, etc are have to be consistent with the parent project.

1. We need tests! Especially, for custom hook like `useDirectDomUpdate` and the order book data provider.
2. All user-facing string are hardcoded at the moment. We need to use localization library like `i18next` to support multiple languages.
3. Force code style using tools like `eslint` and `prettier`.
4. Introduce CSS library for better DX.
5. Support multiple subscription to a single channel for order book provider (currently, two widgets with the same instrument are not supported).
6. Implement loading state for the widget. Most likely the loader will be common for all widgets in the parent project.
7. Integrate with the parent project's CI/CD pipeline.