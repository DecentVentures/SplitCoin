import * as React from 'react';
import {Component} from 'react';
import {Dialog, FlatButton} from 'material-ui';



type Props = {
	open: boolean;
}
type State = {
	waited: boolean;
}
export default class Metamask extends Component<Props> {

	state: State = {
		waited: false
	}

	constructor(props:Props) {
		super(props);
	}

	componentDidMount(){
		setTimeout(() =>{
			this.setState(({waited: true}));
		}, 3000);
	}
	render() {
		const actions = [
			(<FlatButton href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" label="Get Metamask" primary={true} />),
			(<FlatButton href="http://landing.splitcoin.io/howto.html#brief3" label="How To's" primary={true} keyboardFocused={true}/>)
		];

		return (
			<Dialog
			title="Where's Web3?"
			actions={actions}
			modal={false}
			open={this.props.open && this.state.waited}>
			<p>You don't seem to have a Web3 connection.</p>
			<p>You'll need to install Metamask or some Web3 compatible browser</p>
			<p>If you need more help, checkout the How To's</p>
			</Dialog>

		);
	}
}
