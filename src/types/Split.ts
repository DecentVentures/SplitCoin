import { Currency } from './Currency';
export type Split = {
  out_currency: Currency,
  to: string,
  eth_address?: string;
  percent: number;
  balance?: number;
};
