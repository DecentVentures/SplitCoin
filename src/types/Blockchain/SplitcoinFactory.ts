import { Web3Method } from './Web3Method';
export type SplitcoinFactory = {
  methods: {
    contracts: (address: string, index: number) => Web3Method<string>;
    referralContracts: (address: string) => Web3Method<string>;
    referredBy: (address: string) => Web3Method<string>;
    referrals: (address: string, index: number) => Web3Method<string>;
    deployed: (index: number) => Web3Method<string>;
    make: (
      users: string[],
      ppms: number[],
      refer: string,
      claimable: boolean
    ) => Web3Method<string>;
  };
};
