import * as React from 'react';
import { Component } from 'react';
import { Split } from '../types/Split';
import CurrencyView from './CurrencyView';
import { FlatButton, TableRow, TableRowColumn } from 'material-ui';
import AddressPopover from './AddressPopover';
import { RouteComponentProps } from "react-router";

type Props = {
	network: string,
	claimable: boolean,
	split: Split,
	removeSplit?: (split: Split) => (event: React.MouseEvent<any>) => void,
	onClaim?: (split: Split) => (event: React.MouseEvent<any>) => void
} & RouteComponentProps<any>;

type State = {
	open: boolean,
	contract?: string,
	popTarget?: Element
}
export default class SplitView extends Component<Props> {

	state: State = {
		open: false,
	}

	constructor(props:Props) {
		super(props);
		this.contractClick = this.contractClick.bind(this);
		this.handlePopClose = this.handlePopClose.bind(this);
	}

	contractClick(contract: string) {
		return (event: React.MouseEvent<any>) => {
			event.preventDefault();
			event.currentTarget;
			this.setState({
				open: true,
				contract: contract,
				popTarget: event.currentTarget
			});
		}
	}

	handlePopClose() {
		this.setState({
			open: false
		});
	}


	render() {
		let removeCol = this.props.removeSplit ?
			<FlatButton onClick={this.props.removeSplit(this.props.split)} label="Remove Split"  secondary={true}/>
			: null;
		let claimAction = this.props && this.props.onClaim && this.props.claimable && this.props.split && this.props.split.balance && this.props.split.balance > 0 ?
			<FlatButton onClick={this.props.onClaim(this.props.split)} label={`Send: ${this.props.split.balance} ETH`}  secondary={true}/>
			: null;
		return (
			<TableRow>
			<TableRowColumn>
			<CurrencyView coin={this.props.split.out_currency}/>
			</TableRowColumn>
			<TableRowColumn>
			<AddressPopover
			network={this.props.network}
			open={this.state.open}
			onClose={this.handlePopClose}
			anchorEl={this.state.popTarget}
			address={this.props.split.to}
			match={this.props.match} location={this.props.location} history={this.props.history} />
			<FlatButton onClick={this.contractClick(this.props.split.to)}>{this.props.split.to}</FlatButton>
			</TableRowColumn>
			<TableRowColumn>
			{this.props.split.percent ? `${this.props.split.percent}%` : null }
			</TableRowColumn>
			<TableRowColumn>
			{removeCol}{claimAction}
			</TableRowColumn>
			</TableRow>
		);
	}
}
