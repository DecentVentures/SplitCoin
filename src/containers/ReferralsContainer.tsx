import * as React from 'react';
import { Split } from '../types/Split';
import { Ether } from '../types/Currency';
import SplitList from '../components/SplitList';
import SplitNav from '../components/SplitNav';
import { CardActions, CardHeader, RaisedButton } from 'material-ui';
import { Card } from 'material-ui';
import Web3Component from '../components/Web3Component';
import { RouteComponentProps } from "react-router";

let constants = require('../config/constants');
let factoryInterface = require('../blockchain/SplitCoinContract/build/contracts/SplitCoinFactory.json');
let splitInterface = require('../blockchain/SplitCoinContract/build/contracts/ClaimableSplitCoin.json');
let env = require('../config/env');

let factory: any = null;

type Props = {
	match : {
		params: {
			address: string;
			network: string;
		}
	}
} & RouteComponentProps<any>
	type State = {
		address: string,
		deployedContracts: string[],
		referBalance: number,
		pendingBalance: number,
		splits: Split[]

	};
export default class ReferralsContainer extends Web3Component<Props> {

	state: State = {
		address: '',
		referBalance: 0,
		pendingBalance: 0,
		deployedContracts: [],
		splits: []
	}

	constructor(public props: Props) {
		super(props);
		this.onClaimFor = this.onClaimFor.bind(this);
		this.onClaim = this.onClaim.bind(this);
		this.onClaimAll = this.onClaimAll.bind(this);
		this.updatePendingBalance = this.updatePendingBalance.bind(this);
	}

	async componentDidMount() {
		await super.componentDidMount();
		try {
			let network = this.props.match.params.network;
			let factoryAddr = network ? env[network].SPLITCOIN_FACTORY.active : constants.SPLITCOIN_FACTORY;
			//default to the main net if theres no address
			factoryAddr = factoryAddr || env.main.SPLITCOIN_FACTORY.active;
			await this.updateFactory(factoryAddr);

			let viewAddr = this.props.match.params.address || await this.getAccount();
			let referralContractAddr = await this.getReferContractAddr(viewAddr);
			this.setState({
				address: referralContractAddr
			});
			if (viewAddr) {
				await this.populateReferralView(viewAddr);
			}
		} catch (e) {
			console.error(e);
		}
	}
	async updateFactory(factoryAddr: any) {
		try {
			factory = new this.web3.eth.Contract(factoryInterface.abi, factoryAddr);
		} catch (e) {
			console.warn(e);
			console.warn('Error connecting to SplitCoin... make sure you have MetaMask set to the correct network');
			this.setState({
				error: 'Error connecting to SplitCoin... make sure you have MetaMask set to the correct network'
			});
		}
	}


	async unrollWeb3Array(unrollFn: (index: number) => Promise<any>, termination: any) {
		let array = [];
		let index = 0;
		try {
			let unrolled = await unrollFn(index);
			while (unrolled != termination && index < 5) {
				array.push(unrolled);
				index++;
				unrolled = await unrollFn(index);
			}
		} catch (ex) {}
		return array;
	}

	async getReferrals(account: string) {
		let getReferral = (index: number) => factory.methods.referrals(account, index).call();
		let referrals = await this.unrollWeb3Array(getReferral, '0x0');
		return Promise.all(referrals);
	}

	async getContracts(account: string) {
		let getContract = (index: number) => factory.methods.contracts(account, index).call();
		let contracts = await this.unrollWeb3Array(getContract, '0x0');
		return Promise.all(contracts);
	}

	async updatePendingBalance() {
		let account = await this.getAccount();
		let referralContractAddr = await this.getReferContractAddr(account);
		let referContract = new this.web3.eth.Contract(splitInterface.abi, referralContractAddr);
		let pendingWei = await referContract.methods.getClaimableBalance().call({
			from: account
		});
		let pendingBalance = this.web3.utils.fromWei(pendingWei, 'ether');
		return this.setState(({
			pendingBalance
		}));
	}

	async populateReferralView(address: string) {
		let account = await this.getAccount();
		let referralContractAddr = await this.getReferContractAddr(account);
		this.updatePendingBalance();
		let referrals = await this.getReferrals(account);
		for (let referredUser of referrals) {
			let userContracts = await this.getContracts(referredUser);
			for (let contract of userContracts) {
				let splitContract = new this.web3.eth.Contract(splitInterface.abi, contract);
				let contractIsClaimable = await splitContract.methods.isClaimable().call();
				if (contractIsClaimable) {
					let split = {} as Split;
					let referContractPendingBalance = await splitContract.methods.getClaimableBalance().call({
						from: referralContractAddr
					});
					let contractBalance = Number(this.web3.utils.fromWei(referContractPendingBalance, 'ether'));
					split.balance = contractBalance;
					split.out_currency = Ether;
					split.to = contract;
					this.setState({
						splits: this.state.splits.concat(split),
						referBalance: this.state.referBalance + contractBalance
					});
				}
			}
		}
	}

	async onClaim() {
		let account = await this.getAccount();
		let referContract = await this.getReferContractAddr(account);
		let contract = new this.web3.eth.Contract(splitInterface.abi, referContract);
		contract.methods.claim().send({
			from: account
		}).then(() => {
			this.setState(({
				pendingBalance: 0
			}));
		});
	}

	async onClaimAll() {
		let account = await this.getAccount();
		let splits = this.state.splits;
		let referContract = await this.getReferContractAddr(account);
		for (let splitIndex = 0; splitIndex < splits.length; splitIndex++) {
			let split = splits[splitIndex];
			await this.claimFor(split.to, referContract).catch((e) => console.warn(e)).then(() => {
				if(this.state && this.state.referBalance && split && split.balance) {
					return this.setState(({
						referBalance: this.state.referBalance - split.balance
					}));
				}
			});
		}
		return this.updatePendingBalance();
	}


	async claimFor(contractAddr: string, user: string) {
		let account = await this.getAccount();
		// all the splits here point to the contract
		let contract = new this.web3.eth.Contract(splitInterface.abi, contractAddr);
		return contract.methods.claimFor(user).send({
			from: account
		}).then(() => {
			let splits = this.state.splits;
			let index = splits.findIndex((split) => split.to == contractAddr);
			if (index > -1) {
				splits[index].balance = 0;
				this.setState({
					splits
				});
			}
		});

	}
	async onClaimFor(split: Split) {
		let account = await this.getAccount();
		let referContract = await this.getReferContractAddr(account);
		return this.claimFor(split.to, referContract);
	}


	async getReferContractAddr(account: string) {
		let referralContractIndex = await factory.methods.referralContracts(account).call() - 1;
		if (referralContractIndex > -1) {
			let referralContract = await factory.methods.contracts(account, referralContractIndex).call();
			return referralContract;
		} else {
			return Promise.reject(`This account doesn't have a referral contract`);
		}
	}

	async claimReferContractBalance() {
		let account = await this.getAccount();
		let referralContract = await this.getReferContractAddr(account);
		return this.claimFor(referralContract, account);
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
				margin: '25px'
			}
		}

		let network = this.getNetwork();
		let prefix = network ? `/network/${network}` : '';
		let scanUrl = `${prefix}/view/${this.state.address}`;

		return (
			<div className="App">
			<div className="header">
			</div>
			<div className="content App-intro">
			<div>
			<Card>
			<SplitNav network={network} match={this.props.match}
			location={this.props.location} history={this.props.history} >
			</SplitNav>
			<CardHeader style={styles.header} title="Splitcoin - Referrals" subtitle="Pull your referral bonuses into your referral contract" avatar={Ether.imageSmall} />
			<div>
			<div style={styles.contract}><a href={scanUrl}>{this.state.address}</a></div>
			<SplitList network={this.getNetwork()} splits={this.state.splits} claimable={true} onClaim={this.onClaimFor}
			match={this.props.match}
			location={this.props.location}
			history={this.props.history}
			/>
			</div>
			<CardActions>
			<RaisedButton disabled={this.state.referBalance <= 0} onClick={this.onClaimAll} label={`Sweep Referrals: ${this.state.referBalance} ETH`} primary={true} />
			<RaisedButton disabled={this.state.pendingBalance <= 0} onClick={this.onClaim} label={`Claim Balance: ${this.state.pendingBalance} ETH`} primary={true} />
			</CardActions>
			</Card>
			</div>
			</div>
			</div>
		);
	}
}
