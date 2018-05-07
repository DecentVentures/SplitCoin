import * as React from 'react';
import { Menu, MenuItem, Popover, FlatButton } from 'material-ui';
import { PopoverAnimationVertical } from 'material-ui/Popover';
import { Ether } from '../../types/Currency';
import Web3Component from '../Web3Component';
import './NavBar.css';

type State = {
  open: boolean;
  anchorEl: undefined | HTMLElement;
};

export default class NavBar extends Web3Component<any> {
  state: State = {
    open: false,
    anchorEl: undefined
  };

  constructor() {
    super({});
    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleClick(event: any) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({
      open: false
    });
  }

  render() {
    let AccountButton = (
      <FlatButton
        className="AccountButton"
        backgroundColor="#5AB0EF"
        hoverColor="#71C3FF"
        onClick={this.handleClick}
        icon={<img height="65" src={Ether.image} />}
      />
    );

    let BarContent = this.account ? AccountButton : null;
    return (
      <div className="NavBar">
        <div className="SCLogo">
          <img height="80" src="/SCLogo.png" />
        </div>
        {BarContent}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu>
            <MenuItem primaryText="My Contracts" />
            <MenuItem primaryText="Help &amp; feedback" />
            <MenuItem primaryText="Settings" />
            <MenuItem primaryText="Sign out" />
          </Menu>
        </Popover>
      </div>
    );
  }
}
