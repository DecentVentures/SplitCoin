import * as React from 'react';
import  { Component } from 'react';
import { Split } from '../types/Split';
import CurrencySelectorContainer from '../containers/CurrencySelectorContainer';
import { Currency } from '../types/Currency';
import { Ether } from '../types/Currency';
import { TextField, RaisedButton } from 'material-ui';

type Props = {
	onCreate: (param: Split) => void,
	onCurrencyChange: (currency: Currency) => void,
	unallocatedPercent: number
};

type State = {
	split: Split
}
export default class SplitCreate extends Component<Props> {


	public state: State = {
		split: {
			to: '',
			percent: 0.0,
			out_currency: Ether,
			eth_address: '',
			balance: 0
		}
	};

	constructor(props: Props) {
		super(props);
		this.props = props;
		this.state.split.percent = this.props.unallocatedPercent;
		this.currencyChange = this.currencyChange.bind(this);
		this.create = this.create.bind(this);
		this.onSplitToUpdate = this.onSplitToUpdate.bind(this);
		this.onSplitPercentUpdate = this.onSplitPercentUpdate.bind(this);
		this.canCreate = this.canCreate.bind(this);
	}

	currencyChange(currency: Currency) {
		this.setState((state: State) => {
			let split = Object.assign({}, state.split);
			split.out_currency = currency;
			return {
				split
			};
		});
		this.props.onCurrencyChange(currency);
	}


	create() {
		if (this.state.split.percent <= this.props.unallocatedPercent && this.state.split.percent > 0) {
			// emit a copy of the created object
			let split:Split = Object.assign({}, this.state.split);
			this.props.onCreate(split);

			// set the state to a new split with no receiver and the rest of the percents
			let newSplit = Object.assign({}, split);
			newSplit.to = '';
			newSplit.percent = this.props.unallocatedPercent - newSplit.percent;
			newSplit.percent = Number(newSplit.percent.toFixed(1));
			this.setState({
				split: newSplit
			});
		}
	}

	onSplitToUpdate(event: React.FormEvent<any>) {
		if (event.target instanceof HTMLInputElement) {
			let split = this.state.split;
			split.to = event.target.value;
			this.setState({
				split
			});
		}
	}

	onSplitPercentUpdate(event: React.FormEvent<any>) {
		if (event.target instanceof HTMLInputElement) {
			let split = this.state.split;
			split.percent = parseFloat(event.target.value);
			if (split.percent > this.props.unallocatedPercent) {
				split.percent = this.props.unallocatedPercent;
			}
			if (this.props.unallocatedPercent <= 0) {
				split.percent = 0.0;
			}
			this.setState({
				split
			});
		}
	}

	canCreate() {
		return this.props.unallocatedPercent > 0;
	}


	render() {
		return (
			<div className="SplitCreate">
			<CurrencySelectorContainer label="Output Currency" onCoinChange={this.currencyChange}/>
			<TextField floatingLabelText="Send To Address" floatingLabelFixed={true} type="text" value={this.state.split.to} onChange={this.onSplitToUpdate}/>
			<TextField floatingLabelText="Percent To Send" floatingLabelFixed={true} type="number" min={0.0} max={this.props.unallocatedPercent}  value={this.state.split.percent} onChange={this.onSplitPercentUpdate}/>
			<RaisedButton label="Add Split" onClick={this.create} disabled={!this.canCreate()}  primary={true}/>
			</div>
		);
	}
}
