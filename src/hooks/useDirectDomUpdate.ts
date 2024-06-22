import { createElement, useCallback, useEffect, useRef } from "react";
import { Subject } from "../observable/subject";

/**
 * !IMPORTANT!: usage of this hook is highly discouraged in most cases, as it bypasses React's lifecycle
 * and makes the code harder to maintain. Use it only when we have a lot of frequent updates 
 * for the same component.
 * 
 * As name implies, this hook is used to update the DOM directly without React.
 * We have a lot of real-time updates in the order book, and we want to optimize the rendering.
 * This hook optimizes rendering by skipping comprehensive React's diffing and reconciliation process.
 * 
 * NOTE(georgii.savin): Brief performance comparison showed 5-10x CPU time improvement 
 * in the order book rendering while processing frequent updates from wss://api.prod.rabbitx.io/ws.
 * Also, it helps to reduce amount of created objects and DOM nodes, so we manage memory in a better way.
 * 
 * @param subject - The subject to subscribe to
 * @param callback - The callback to call when the subject emits a new value or component is mounted
 * @param options - object containing tagName and props for constructing react element
 * @returns - react element
 */
export function useDirectDomUpdate<T>(
  subject: Subject<T>,
  callback: (value: T, el: HTMLElement) => string,
  options: { tagName: string, props: object } = { tagName: "span", props: {} },
): React.ReactElement {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const sub = subject.subscribe((newVal) => {
      if (ref.current) {
        callback(newVal, ref.current);
      }
    });
    return () => sub.unsubscribe();
  }, [subject, callback]);

  const setRef = useCallback(
    (el: HTMLSpanElement | null) => {
      if (el) {
        ref.current = el;
        callback(subject.getValue(), el);
      }
    },
    [subject, callback]
  );

  return createElement(options.tagName, { ...options.props, ref: setRef });
}
