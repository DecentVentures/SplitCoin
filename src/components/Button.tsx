import * as React from 'react';
import  { Component } from 'react';
import { RaisedButton } from 'material-ui';
type Props = {
	onClick: ()=> void,
	label: string
}
export default class Button extends Component<Props> {

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<RaisedButton label={this.props.label} onClick={this.props.onClick}/>
		);
	}
}
