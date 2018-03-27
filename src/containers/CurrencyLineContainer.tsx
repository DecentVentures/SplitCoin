import * as React from 'react';
import * as _ from 'lodash';
import { Currency, Ether } from '../types/Currency';
import { TinyProxyFactory } from '../types/Blockchain/TinyProxyFactory';
import CurrencyLine from '../components/CurrencyLine';
import Web3Component from '../components/Web3Component';
import { RouteComponentProps } from 'react-router';

let request = require('request-promise');
let env = require('../config/env');
let constants = require('../config/constants');
let tinyproxyfactoryInterface = require('../blockchain/TinyProxyContract/build/contracts/TinyProxyFactory.json');

type Props = {
  destination: string;
};
type RouteProps = Props & RouteComponentProps<any>;
type State = {
  coins: Currency[];
  outputAddress: string | null;
};
export default class CurrencyLineContainer extends Web3Component<Props> {
  state: State = {
    coins: [],
    outputAddress: null
  };

  TinyProxyFactory: TinyProxyFactory;
  constructor(props: RouteProps) {
    super(props);
    if (!this.state.coins || !this.state.coins.length) {
      request('https://cors.shapeshift.io/getcoins').then((resp: any) => {
        let json = JSON.parse(resp);
        let coins = _.values(json);
        let availableCoins = coins.filter(
          coin => coin.status === 'available' && coin.name !== 'Ether'
        );
        this.setState({
          coins: availableCoins
        });
      });
    }
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
  }

  coinSelected = async (coin: Currency) => {
    const proxyAddr = await this.TinyProxyFactory.methods
      .proxyFor(this.account, this.props.destination)
      .call();
    console.log(proxyAddr);
    const hasProxy = proxyAddr !== '0x0000000000000000000000000000000000000000';
    if (hasProxy) {
      let output = await this.generateShiftAddress(
        coin,
        Ether,
        proxyAddr
      );
      this.setState({ outputAddress: output.deposit });
    } else {
      let account = await this.getAccount();
      await this.TinyProxyFactory.methods
        .make(this.props.destination, 50000, true)
        .send({
          from: account
        });
    }
  }

  async generateShiftAddress(
    from: Currency,
    to: Currency,
    toAddr: string,
    returnAddr?: string
  ) {
    let shiftData = {
      url: 'https://cors.shapeshift.io/shift',
      json: true,
      form: {
        withdrawal: toAddr,
        reusable: true,
        pair: from.symbol + '_' + to.symbol,
        apiKey: constants.SHAPESHIFT_PUB_KEY
      }
    };
    if (returnAddr) {
      Object.assign(shiftData.form, { returnAddress: returnAddr });
    }
    return request.post(shiftData);
  }

  render() {
    return (
      <div>
        <CurrencyLine
          onCoinClick={this.coinSelected}
          coins={this.state.coins}
        />
        <div style={{ padding: '25px' }}>
          {this.state.outputAddress != null ? this.state.outputAddress : ''}
        </div>
      </div>
    );
  }
}
