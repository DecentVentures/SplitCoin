import { Web3Method } from '../Blockchain/Web3Method';
export type TinyProxy = {
  methods: {
    release: () => Web3Method<{}>;
  };
};
