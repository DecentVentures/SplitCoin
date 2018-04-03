import * as React from 'react';
import { TinyProxyFactory } from '../types/Blockchain/TinyProxyFactory';
import { TinyProxy } from '../types/Blockchain/TinyProxy';
import Web3Component from '../components/Web3Component';
import { RouteComponentProps } from 'react-router';
import { RaisedButton } from 'material-ui';

let env = require('../config/env');
let constants = require('../config/constants');
let tinyproxyfactoryInterface = require('../blockchain/TinyProxyContract/build/contracts/TinyProxyFactory.json');
let tinyproxyInterface = require('../blockchain/TinyProxyContract/build/contracts/TinyProxy.json');

type Props = {
  destination: string;
};
type RouteProps = Props & RouteComponentProps<any>;
type State = {
  outputAddress: string | null;
  proxyContract: string | null;
  balance: number;
};
export default class ReleaseProxyButton extends Web3Component<RouteProps> {
  state: State = {
    outputAddress: null,
    proxyContract: null,
    balance: 0
  };

  TinyProxyFactory: TinyProxyFactory;
  TinyProxy: TinyProxy;
  constructor(props: RouteProps) {
    super(props);
  }

  async componentDidMount() {
    await super.componentDidMount();
    let network = this.getNetwork() || 'main';
    let factoryAddr = network
      ? env[network].TINYPROXY_FACTORY.active
      : constants.TINYPROXY_FACTORY;

    this.TinyProxyFactory = new this.web3.eth.Contract(
      tinyproxyfactoryInterface.abi,
      factoryAddr
    );

    console.log('account' , this.account, 'destination', this.props.destination);
    let proxyContract = await this.TinyProxyFactory.methods
      .proxyFor(this.account, this.props.destination)
      .call();

    this.TinyProxy = new this.web3.eth.Contract(
      tinyproxyInterface.abi,
      proxyContract
    );


    const balance = this.web3.eth.getBalance(proxyContract);

    this.setState({ proxyContract, balance });
  }

  async componentWillReceiveProps(newProps: RouteProps) {
    let proxyContract = await this.TinyProxyFactory.methods
      .proxyFor(this.account, newProps.destination)
      .call();

    const hasProxy = proxyContract !== '0x0000000000000000000000000000000000000000';

    if(hasProxy) {

      this.TinyProxy = new this.web3.eth.Contract(
        tinyproxyInterface.abi,
        proxyContract
      );

      const weiBalance = await this.web3.eth.getBalance(proxyContract);
      const balance = this.web3.utils.fromWei(weiBalance, 'ether');
      this.setState({ proxyContract, balance });
    }
  }

  release = async() => {
    await this.TinyProxy.methods.release().send({from: this.account});
  }

  render() {
    const ReleaseButton = (
      <RaisedButton label={`Release Pending Balance : ${this.state.balance} ETH`} onClick={this.release} />
    );
    const MaybeButton = this.state.balance > 0 ? ReleaseButton : '';
    return <div>{MaybeButton}</div>;
  }
}
