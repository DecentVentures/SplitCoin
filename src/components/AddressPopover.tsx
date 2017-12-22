import * as React from 'react';
import { Component } from 'react';
import { Popover, IconButton } from 'material-ui';
import { RouteComponentProps } from "react-router";
let clipboard = require('clipboard-js');
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import RemoveRedEye from 'material-ui/svg-icons/image/remove-red-eye';

let request = require('request-promise');
const options = {
	anchorOrigin: {
		horizontal: "right",
		vertical: "top"
	} as any,
	targetOrigin: {
		horizontal: "left",
		vertical: "top"
	} as any
}

type State = {
	isSS: boolean
}
type Props = {
	network:string,
	open: boolean,
	anchorEl?: Element,
	address?: string,
	onClose: () => void
} & RouteComponentProps<any> ;

export default class AddressPopover extends Component<Props> {

	state: State = {
		isSS: false
	}
	constructor(props: Props) {
		super(props);
		this.copyToClip = this.copyToClip.bind(this);
		this.viewContract = this.viewContract.bind(this);
		this.viewShapeShift = this.viewShapeShift.bind(this);
	}

	async componentDidMount() {
		await this.isShapeShift().then((isSS) => {
			this.setState(({
				isSS: isSS
			}));
		});
	}

	copyToClip() {
		clipboard.copy(this.props.address);
	}

	viewContract() {
		let network = this.props.network;
		let prefix = network ? `/network/${network}` : '';
		this.props.history.push({pathname: `${prefix}/view/${this.props.address}`});
		//window.location = `${prefix}/view/${this.props.address}`;
	}

	viewShapeShift() {
		if(this.props.address && window) {
			window.location.href = `https://shapeshift.io/txStat/${this.props.address.toLowerCase()}`;
		}
	}

	async isShapeShift() {
		if (this.props.address) {
			let url = `https://cors.shapeshift.io/txStat/${this.props.address.toLowerCase()}`;
			return request(url)
				.then((data: any) => JSON.parse(data))
				.then((json: any) => {
					if (json.status != 'error') {
						return true;
					} else {
						return false;
					}
				});
		}
	}

	render() {
		let ssIcon = <img height='24px' src='/lens_icon.png'/>
			let ssButton = this.state.isSS ? <IconButton onClick={this.viewShapeShift}>{ssIcon}</IconButton> : null;
		return (
			<Popover
			open={this.props.open}
			anchorEl={this.props.anchorEl}
			anchorOrigin={options.anchorOrigin}
			targetOrigin={options.targetOrigin}
			onRequestClose={this.props.onClose}
			>
			<IconButton onClick={this.copyToClip}><ContentCopy/></IconButton>
			<IconButton onClick={this.viewContract}><RemoveRedEye/></IconButton>
			{ssButton}
			</Popover>
		);
	}
}
