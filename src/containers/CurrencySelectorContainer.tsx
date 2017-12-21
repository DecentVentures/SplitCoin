import * as React from 'react';
import  { Component } from 'react';
import * as _ from 'lodash';
import { Currency } from '../types/Currency';
import CurrencySelector from '../components/CurrencySelector';

let request = require('request-promise');

type Props = {
	label: string
	onCoinChange: (currency: Currency)=>void
};
type State = {
	selectedCurrency?: Currency,
	coins: Currency[]
};

export default class CurrencySelectorContainer extends Component<Props> {

	state: State = {
		coins: []
	}
	constructor(props: Props) {
		super(props);
		if (!this.state.coins || !this.state.coins.length) {
			request('https://cors.shapeshift.io/getcoins').then((resp: any) => {
				let json = JSON.parse(resp);
				this.setState({
					coins: _.values(json),
					selectedCurrency: json.ETH
				});
			});
		}
	}

	onCoinChange = (event:Event, index: number, value: Currency) => {
		console.log('CurrencySelectorContainer', value);
		this.setState({
			selectedCurrency: value
		});
		this.props.onCoinChange(value);
	};

	render() {
		let coins = this.state.coins || [];
		return (
			<CurrencySelector
			coins={coins}
			label={this.props.label}
			selectedCurrency={this.state.selectedCurrency}
			onCoinChange={this.onCoinChange} />
		);
	}
}
