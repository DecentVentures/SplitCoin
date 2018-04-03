export type Web3Method<T> = {
  call: (args?: {}) => Promise<T>,
  send: (args?: {}) => Promise<T>
};
