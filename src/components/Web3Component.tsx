import  { Component } from 'react';
import { RouteComponentProps } from "react-router";
let request = require('request-promise');
let Web3 = require('web3');
let Eth = require('ethjs');

type Props<T> = RouteComponentProps<{
	network: string
} & T>;

export default class Web3Component<T> extends Component<Props<T>> {
	eth = Eth;
	web3 = Web3;
	account: string = '';
	hasWeb3: boolean = false;

	constructor(props: Props<T>) {
		super(props);
	}

	async componentDidMount() {
		await this.setWeb3();
		this.account = await this.getAccount();
	}

	setWeb3() {
		return this.setLocalWeb3().catch(() => this.setPublicWeb3());
	}

	setPublicWeb3() {
		console.log('Falling back to use gloabl Web3 provider');
		let network = this.getNetwork() || 'main';
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
		let win : Window & {web3: any}  = window as any;
		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		console.log('Attempting to use local Web3', window);
		if (win && win.web3 && win.web3.currentProvider) {
			this.web3 = new Web3(win.web3.currentProvider);
			this.eth = new Eth(win.web3.currentProvider);
			console.log('Using injected Web3');
			this.hasWeb3 = true;
			return Promise.resolve(this.web3);
		} else {
			return Promise.reject("You need a web3 provider");
		}
	}

	getNetwork() {
		return this.props.match.params.network;
	}

	public async getAccount(): Promise<string> {
		if(this.hasWeb3) {
			let accounts = await this.web3.eth.getAccounts();
			return accounts[0];
		} else {
			return '';
		}
	}
}
