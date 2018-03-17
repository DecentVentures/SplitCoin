import * as React from 'react';
import {Component} from 'react';
import {Dialog, FlatButton} from 'material-ui';



type Props = {
	open: boolean;
}
type State = {
	shouldOpen: boolean;
}
export default class Metamask extends Component<Props> {

	state: State = {
		shouldOpen: false
	}

	constructor(props:Props) {
		super(props);
	}

	componentDidMount(){
		setTimeout(() =>{
			this.setState(({shouldOpen: true}));
		}, 3000);
	}

	okay = () => {
		this.setState({shouldOpen: false});	
	}

	render() {
		const actions = [
			(<FlatButton href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" label="Get Metamask" primary={true} />),
			(<FlatButton label="Okay" onClick={this.okay} primary={true} keyboardFocused={true}/>)
		];

		return (
			<Dialog
			title="Where's Web3?"
			actions={actions}
			modal={false}
			open={this.props.open && this.state.shouldOpen}>
			<p>You don't seem to have a Web3 connection.</p>
			<p>You'll need to install Metamask or some Web3 compatible browser to deploy SplitCoin contracts</p>
			</Dialog>

		);
	}
}
