import { Web3Method } from '../Blockchain/Web3Method';
export type TinyProxyFactory = {
  methods: {
    make: (to: string, gas: number, track: boolean) => Web3Method<string>,
    proxyFor: (to: string, gas: number) => Web3Method<string>
  }
};
