import * as React from 'react';
import { Split } from '../types/Split';
import { Ether } from '../types/Currency';
import SplitList from '../components/SplitList';
import SplitNav from '../components/SplitNav';
import {  CardHeader } from 'material-ui';
import { CardActions, RaisedButton } from 'material-ui';
import { Card } from 'material-ui';
import Web3Component from '../components/Web3Component';

let splitInterface = require('../blockchain/build/contracts/ClaimableSplitCoin.json');

type State = {
	address: string,
	isSplitContract: boolean,
	deployedContracts: string[],
	pendingBalance: number,
	splits: Split[],
	claimable: boolean
}
export default class SplitcoinViewContainer extends Web3Component<any> {

	state: State = {
		address: '',
		splits: [],
		pendingBalance: 0,
		deployedContracts: [],
		claimable: false,
		isSplitContract: true
	}

	constructor(props: any) {
		super(props);
		this.onClaimFor = this.onClaimFor.bind(this);
		this.onClaim = this.onClaim.bind(this);
	}

	async componentDidMount() {
		await super.componentDidMount();
		try {
			let viewAddr = this.props.match.params.address;
			this.setState({
				address: viewAddr
			});
			if (viewAddr) {
				await this.populateViewContract(viewAddr);
			}
		} catch (e) {
			this.setState({isSplitContract: false});
		}
	}

	async populateViewContract(address: string) {
		let contract = new this.web3.eth.Contract(splitInterface.abi, address);
		let splitCount = await contract.methods.getSplitCount().call();
		let contractIsClaimable = await contract.methods.isClaimable().call();
		if (contractIsClaimable) {
			let account = await this.getAccount();
			let pendingWei = await contract.methods.getClaimableBalance().call({
				from: account
			});
			let pendingBalance = this.web3.utils.fromWei(pendingWei, 'ether');
			this.setState({
				claimable: true,
				pendingBalance: pendingBalance
			});
		}
		for (let index = 0; index < splitCount; index++) {
			let split = await contract.methods.splits(index).call();
			split.out_currency = Ether;
			split.percent = split.ppm / 1000000 * 100;
			if (contractIsClaimable) {
				let wei = await contract.methods.getClaimableBalanceFor(split.to).call();
				split.balance = this.web3.utils.fromWei(wei, 'ether');
			}
			this.setState({
				splits: this.state.splits.concat(split),
			});
		}
	}

	async onClaim() {
		let contract = new this.web3.eth.Contract(splitInterface.abi, this.state.address);
		this.web3.eth.getAccounts()
			.then(async(accounts: string[]) => {
				let account = accounts[0];
				await contract.methods.claim().send({
					from: account
				});
				let splits = this.state.splits;
				let index = splits.findIndex((split) => split.to == account);
				if (index > -1) {
					splits[index].balance = 0;
					this.setState({
						splits,
						pendingBalance: 0
					});
				}

			});
	}


	async onClaimFor(split: Split) {
		let contract = new this.web3.eth.Contract(splitInterface.abi, this.state.address);
		let account = await this.getAccount();
		return contract.methods.claimFor(split.to).send({
			from: account
		}).then(() => {
			let splits = this.state.splits;
			let index = splits.indexOf(split);
			if (index > -1) {
				splits[index].balance = 0;
				this.setState({
					splits
				});
			}
		});
	}



	render() {
		const styles = {
			card: {
				width: '50%',
				margin: '0 auto',
				marginTop: '15px'
			},
			header: {
				paddingRight: '0px'
			},
			contract: {
				margin: '25px',
				overflow: 'hidden'
			}
		} as React.CSSProperties;

		let network = this.props.match.params.network;
		let prefix = network ? network + '.' : '';
		let scanUrl = `https://${prefix}etherscan.io/address/${this.state.address}`;
		return (
			<div className="App">
			<div className="header">
			</div>
			<div className="content App-intro">
			<div>
			<Card>
			<SplitNav contracts={this.state.deployedContracts} network={network}
			match={this.props.match} location={this.props.location} history={this.props.history}>
			</SplitNav>
			<CardHeader style={styles.header} title="Splitcoin" subtitle="Income automation, powered by Ethereum" avatar={Ether.imageSmall} />
			<div>
			<div style={styles.contract}><a href={scanUrl}>{this.state.address}</a></div>
			<SplitList network={this.getNetwork()} splits={this.state.splits} claimable={this.state.claimable} onClaim={this.onClaimFor}
			match={this.props.match} location={this.props.location} history={this.props.history}
			/>
			</div>
			<CardActions>
			<RaisedButton disabled={this.state.pendingBalance <= 0} onClick={this.onClaim} label={`Claim: ${this.state.pendingBalance} ETH`} primary={true} />
			</CardActions>
			</Card>
			</div>
			</div>
			</div>

		);
	}
}
