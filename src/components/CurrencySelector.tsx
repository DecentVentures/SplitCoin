import * as React from 'react';
import { Component } from 'react';
import { Currency } from '../types/Currency';
import { SelectField, MenuItem } from 'material-ui';

type Props = {
	label: string,
	currency?: Currency,
	onCoinChange?:(event:Event, index: number, value: Currency) => void,
	selectedCurrency?: Currency,
	coins:  Currency[]
};

type State = {
	selectedCurrency?: Currency
}

export default class CurrencySelector extends Component<Props> {
	public state: State = {};
	constructor(props:Props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.setCurrency = this.setCurrency.bind(this);
	}

	componentDidMount() {
		this.setCurrency(this.props.selectedCurrency);
	}

	shouldComponentUpdate(nextProps: any, nextState: any) {
		if (nextProps.selectedCurrency && this.state.selectedCurrency == null) {
			this.setCurrency(nextProps.selectedCurrency);
		}
		let shouldUpdate = nextProps.coins && this.state.selectedCurrency != nextProps.selectedCurrency;
		return shouldUpdate;
	}

	onChange(event: any, index: number, value: Currency) {
		this.setCurrency(value);
		if(this.props.onCoinChange) {
			this.props.onCoinChange(event, index, value);
		}
	}

	setCurrency(currency?: Currency) {
		return this.setState({
			selectedCurrency: currency
		});
	}

	render() {
		let selected = this.state.selectedCurrency || this.props.selectedCurrency;
		let mkImage = (src: string) => {
			return  <img src={src} /> 
		};
		let currencyItems = this.props.coins.map((coin) => {
			return <MenuItem key={coin.name} value={coin} primaryText={coin.name} rightIcon={mkImage(coin.imageSmall)}/>
		});
		return (
			<SelectField floatingLabelText={this.props.label} value={selected} onChange={this.onChange}>
			{currencyItems}
			</SelectField>
		);
	}

}
