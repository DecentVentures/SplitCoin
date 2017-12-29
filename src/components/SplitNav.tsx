import * as React from 'react';
import { Badge, Subheader, Drawer, List, ListItem, FlatButton } from 'material-ui';
import AddressPopover from './AddressPopover';
import { SplitcoinContract } from '../types/SplitcoinContract';
import { RouteComponentProps } from "react-router";
import Web3Component from "./Web3Component";

type Props = {
	network: string,
	contracts?: string[],
	onContractClick?: (contract: SplitcoinContract) => {}
} & RouteComponentProps<any>

	type State = {
		navOpen: boolean,
		open: boolean,
		popTarget?: Element,
		contract?: string
	}

export default class SplitNav extends Web3Component<Props> {

	state: State = {
		navOpen: true,
		open: false,
	}

	constructor(public props: Props) {
		super(props);
		this.handlePopClose = this.handlePopClose.bind(this);
		this.navClick = this.navClick.bind(this);
	}


	contractClick(contract: string) {
		return (event: any) => {
			event.preventDefault();
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

	navShouldBeOpen() {
		return this.props.contracts && this.props.contracts.length > 0;
	}

	navClick() {
		if (this.navShouldBeOpen()) {
			this.setState(({
				navOpen: !this.state.navOpen
			}));
		} else {
			let network = this.props.network;
			let prefix = network ? `/network/${network}` : '';
			this.props.history.push(`${prefix}/`);
			//window.location = `/`;
		}
	}

	render() {
		let styles = {
			left: {
				position: 'fixed',
				bottom: 0,
				left: 0
			},
			right: {
				position: 'fixed',
				bottom: 0,
				right: 0
			},
			badge: {
				margin: '-25px'
			}
		} as React.CSSProperties;
		let contracts = this.props.contracts ? this.props
			.contracts.map((contract => <ListItem key={contract} onClick={this.contractClick(contract)}>
				{ contract }
				</ListItem>)) : [];

		let contractCount = this.props.contracts ? this.props.contracts.length : 0;
		let icon = (<img onClick={this.navClick} src="/iconw.png" className="App-side-logo" alt="logo" />);
		let badge = (
			<Badge style={styles.badge} badgeContent={contractCount} primary={true} >
			{icon}
			</Badge>
		);

		return (
			!this.navShouldBeOpen() || !this.state.navOpen ?
			(<div className="menu App-side-header-placehold">
				{contractCount > 0 ? badge : icon }
				</div>
			) :
			(<Drawer className="SplitNav menu" open={this.state.navOpen && this.navShouldBeOpen()}>
				<div className="App-side-header">
				<img onClick={this.navClick} src="/iconw.png" className="App-side-logo" alt="logo" />
				</div>
				<List>
				<Subheader>Deployed Contracts</Subheader>
				{contracts}
				</List>
				<FlatButton style={styles.right} href={`/referrals/${this.account}`} label="Referrals"/>
				<FlatButton style={styles.left} href={`/refer/${this.account}`} label="Referral Link"/>
				<AddressPopover
				network={this.props.network}
				open={this.state.open}
				onClose={this.handlePopClose}
				anchorEl={this.state.popTarget}
				address={this.state.contract}
				match={this.props.match} location={this.props.location} history={this.props.history}/>
				</Drawer>
			)
		);
	}
}
