import * as React from 'react';
import  { Component } from 'react';
import { Currency } from '../types/Currency';
import IconButton from 'material-ui/IconButton';

type Props = {
	coins: Currency[]
	onCoinClick: (currency: Currency)=>void
}

export default class CurrencyLine extends Component<Props> {
		constructor(props: Props) {
		super(props);
	}

	render() {
		let coins = this.props.coins || [];
		let mkImage = (coin: Currency) => {
			return  <IconButton key={coin.name}><img src={coin.imageSmall} onClick={() => this.props.onCoinClick(coin)} /></IconButton>
		};
		let images = coins.map((coin) => mkImage(coin)); 

		return (
			<div>{images}</div>
		);
	}
}
