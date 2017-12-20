import * as React from 'react';
import { Component } from 'react';
import { Currency } from '../types/Currency';

type Props = {coin: Currency};
type State = {};
export default class CurrencyView extends Component<Props> {

  props: Props;
  constructor(props: Props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return this.props.coin != nextProps.coin;
  }

  render() {
    return (
      <div>
        <img src={this.props.coin.imageSmall}/> {this.props.coin.symbol.toUpperCase()}
       </div>
      );
  }
}
