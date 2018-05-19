import * as React from 'react';
import { Menu, MenuItem, Popover, FlatButton } from 'material-ui';
import { PopoverAnimationVertical } from 'material-ui/Popover';
import { Ether } from '../../types/Currency';
import Web3Component from '../Web3Component';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

type State = {
  open: boolean,
  anchorEl: undefined | HTMLElement
};

type Props = {};

export default class NavBar extends Web3Component<any> {
  state: State = {
    open: false,
    anchorEl: undefined
  };

  constructor(props: Props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleClick(event: React.MouseEvent<HTMLElement>) {
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
    const styles = {
      NavLink: {
        textDecoration: 'none',
        color: 'inherit'
      }
    };
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
        <NavLink style={styles.NavLink} to="/">
          <div className="SCLogo">
            <img height="80" src="/SCLogo.png" />
          </div>
        </NavLink>
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
            <MenuItem>
              <NavLink style={styles.NavLink} to="/contracts">
                My Contracts
              </NavLink>
            </MenuItem>
            <MenuItem>
              <NavLink style={styles.NavLink} to="/contracts">
                Shapeshift Orders
              </NavLink>
            </MenuItem>
          </Menu>
        </Popover>
      </div>
    );
  }
}
