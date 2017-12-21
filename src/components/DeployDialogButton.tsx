import * as React from 'react';
import { Component } from 'react';

import { Dialog } from 'material-ui';
import { FlatButton } from 'material-ui';
import { RaisedButton } from 'material-ui';
import { CircularProgress } from 'material-ui';

/**
 *  * Dialog with action buttons. The actions are passed in as an array of React objects,
 *   * in this example [FlatButtons](/#/components/flat-button).
 *    *
 *     * You can also close this dialog by clicking outside the dialog, or with the 'Esc' key.
 *      */
type Props = {
	disabled: boolean,
  deployed: string,
  label?: string,
  onAgree: () => void,
  onStart: () => void
}

type State = {
	open: number
}

export default class DeployDialogButton extends Component<Props> {

	state: State = {
    open: 0,
  };

  doesUserAgree = () => {
    this.setState((state) => ( {
      open: 1
    }));
    this.props.onStart();
  }

  handleClose = () => {
    this.setState((state) => ({
      open: 0
    }));
  }

  disagree = () => {
    this.setState((state) => ({
      open: 0
    }));
  }

  agree = () => {
    this.setState((state) => ({
      open: 2
    }));
    this.props.onAgree();
  }

  didDeploy() {
    return this.state.open === 2 && this.props.deployed != null && this.props.deployed.length > 0 && this.props.deployed != 'ERROR';
  }


  render() {
    const styles = {
      center: {
        display: 'block',
        margin: '0 auto'
      }
    };
    const actions = [
      (<FlatButton label="Disagree" primary={true} onClick={this.disagree} />),
      (<FlatButton label="Agree" primary={true} keyboardFocused={true} onClick={this.agree} />)
    ];


    return (
      <div>
				<RaisedButton disabled={this.props.disabled} label={this.props.label || "Next"} onClick={this.doesUserAgree} primary={true}/>

				<Dialog title="Confirm" actions={actions} modal={true} open={this.state.open == 1} onRequestClose={this.handleClose}>
					<p>Thanks for using SplitCoin! We're about to deploy a smart contract for you.</p>
					<p>Be warned, this is experimental software. The author is not liable should something go wrong.</p>
					<p>Make sure to pay attention to your gas price, try 1 Gwei or .1 Gwei if you don't mind waiting a few minutes.</p>
					<p>By submitting you agree to a 0.25% developer fee on transactions that flow through this contract.</p>
					<p>If you've been referred, a portion of that developer fee may go towards the person that referred you.</p>
					<p>If you've selected Sender Pays Gas, make sure all of the addresses are valid and can be sent to with a gas budget of 60k wei.</p>
				</Dialog>

				<Dialog title="Deploying" modal={false} open={this.state.open == 2 && !this.didDeploy()} onRequestClose={this.handleClose}>
					<div>This may take a moment...</div>
					<CircularProgress style={styles.center} size={60} thickness={7} />
				</Dialog>

				<Dialog title="Uhoh!" modal={false} open={this.state.open == 2 && this.props.deployed == "ERROR"} onRequestClose={this.handleClose}>
					<div>
						<p>We've been waiting for this contract for a while...</p>
						<p>Check your transactions and see if you have a pending one.</p>
						<p>If you set a really low gas price this is expected, just wait until the transaction is accepted, or try again.</p>
						<p>If you don't have a pending transaction then check how much gas you're sending and try again</p>
					</div>
				</Dialog>


				<Dialog title="SplitCoin Deployed!" modal={false} open={this.didDeploy()} onRequestClose={this.handleClose}>
					Contract deployed at {this.props.deployed}
				</Dialog>
       </div>
      );
  }
}
