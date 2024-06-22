/**
 * Subject is a simple implementation of the Observable/Observer pattern.
 * Inspired by RxJS's BehaviorSubject.
 */
export interface Subject<T> {
  subscribe: (observer: (arg: T) => void) => { unsubscribe: () => void };
  next: (arg: T) => void;
  getValue: () => T;
}

export const newSubject = <T>(value: T): Subject<T> => {
  let observers: Set<(arg: T) => void> = new Set();
  let lastValue = value;
  return {
    subscribe: (observer: (arg: T) => void) => {
      observers.add(observer);
      return {
        unsubscribe: () => {
          observers.delete(observer);
        },
      };
    },
    next: (value: T) => {
      lastValue = value;
      observers.forEach((observer) => observer(value));
    },
    getValue: () => lastValue,
  };
};
