export type ReturnPromise<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T;

export type Promisify<T> = {
  [P in keyof T]: ReturnPromise<T[P]>;
};
