import  { Component } from 'react';
import { RouteComponentProps } from "react-router";
let request = require('request-promise');
let Web3 = require('web3');
let Eth = require('ethjs');
let window : Window & {web3: any};

type Props<T> = RouteComponentProps<{
	network: string
} & T>;

export default class Web3Component<T> extends Component<Props<T>> {
	eth = Eth;
	web3 = Web3;
	account: string = '';

	constructor(props: Props<T>) {
		super(props);
	}

	async componentDidMount() {
		this.setWeb3();
		this.account = await this.getAccount();
	}

	setWeb3() {
		return this.setLocalWeb3().catch(() => this.setPublicWeb3());
	}

	setPublicWeb3() {
		console.log('Falling back to use gloabl Web3 provider');
		let network = this.getNetwork();
		if (network == 'main') {
			return request("https://api.myetherapi.com/eth").then(() => {
				this.web3 = new Web3(new Web3.providers.HttpProvider("https://api.myetherapi.com/eth"));
				this.eth = new Eth(new Web3.providers.HttpProvider("https://api.myetherapi.com/eth"));
				console.log('Using mainnet myetherapi/eth');
				return Promise.resolve(this.web3);
			});
		}
		if (network == 'ropsten') {
			return request("https://api.myetherapi.com/rop").then(() => {
				this.web3 = new Web3(new Web3.providers.HttpProvider("https://api.myetherapi.com/rop"));
				this.eth = new Eth(new Web3.providers.HttpProvider("https://api.myetherapi.com/rop"));
				console.log('Using ropsten myetherapi/rop');
				return Promise.resolve(this.web3);
			});
		}
		return Promise.reject("No public network found");
	}

	setLocalWeb3() {
		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		console.log('Attempting to use local Web3');
		if (window && window.web3 !== 'undefined') {
			this.web3 = new Web3(window.web3.currentProvider);
			this.eth = new Eth(window.web3.currentProvider);
			console.log('Using injected Web3');
			return Promise.resolve(this.web3);
		} else {
			console.log('No web3? You should consider trying MetaMask!')
			// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
			this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
			this.eth = new Eth(new Web3.providers.HttpProvider("http://localhost:8545"));
			console.log('Using localhost Web3');
			return Promise.resolve(this.web3);
		}
	}

	getNetwork() {
		if (this.props.match) {
			return this.props.match.params.network;
		} else {
			return 'main';
		}
	}

	public async getAccount(): Promise<string> {
		let accounts = await this.web3.eth.getAccounts();
		return accounts[0];
	}
}
