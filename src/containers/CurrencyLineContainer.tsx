import * as React from 'react';
import  { Component } from 'react';
import * as _ from 'lodash';
import { Currency, Ether } from '../types/Currency';
import CurrencyLine from '../components/CurrencyLine';

let request = require('request-promise');
let constants = require('../config/constants');

type Props = {
	destination: string
};
type State = {
	coins: Currency[],
	outputAddress: string | null
};
export default class CurrencyLineContainer extends Component<Props> {
	state: State = {
		coins: [],
		outputAddress: null
	};
	constructor(props: Props) {
		super(props);
		if (!this.state.coins || !this.state.coins.length) {
			request('https://cors.shapeshift.io/getcoins').then((resp: any) => {
				let json = JSON.parse(resp);
				let coins = _.values(json);
				let availableCoins = coins.filter((coin) => coin.status == 'available' && coin.name !== 'Ether');
				this.setState({
					coins: availableCoins,
				});
			});
		}
	}

	coinSelected = async(coin: Currency) => {
		let output = await this.generateShiftAddress(coin, Ether, this.props.destination);
		console.log(output);
		this.setState({outputAddress : output.deposit});
	}


	async generateShiftAddress(from: Currency, to: Currency, toAddr: string, returnAddr?: string) {
		let shiftData = {
			url: 'https://cors.shapeshift.io/shift',
			json: true,
			form: {
				withdrawal: toAddr,
				reusable:true,
				pair: from.symbol + '_' + to.symbol,
				apiKey: constants.SHAPESHIFT_PUB_KEY
			}
		};
		if (returnAddr) {
			Object.assign(shiftData.form, {returnAddress : returnAddr});
		}
		console.log(shiftData);
		return request.post(shiftData);
	}

	render() {
		return (
			<div>
			<CurrencyLine onCoinClick={this.coinSelected} coins={this.state.coins} />
			<div style={{padding: '25px'}}>
			{this.state.outputAddress != null ? this.state.outputAddress : ''}
			</div>
			</div>
		);
	}
}
