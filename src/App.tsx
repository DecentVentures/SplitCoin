import * as React from 'react';
import { Component } from 'react';
import SplitcoinContainer from './containers/SplitcoinContainer';
import SplitcoinViewContainer from './containers/SplitcoinViewContainer';
import ReferralsContainer from './containers/ReferralsContainer';
import ViewMyContractsContainer from './containers/ViewMyContracts';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
const customHistory = createBrowserHistory();

export default class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Router history={customHistory}>
          <Switch>
            <Route exact={true} path="/" component={SplitcoinContainer} />
            <Route
              exact={true}
              path="/refer/:refer?"
              component={SplitcoinContainer}
            />
            <Route
              exact={true}
              path="/view/:address?"
              component={SplitcoinViewContainer}
            />
            <Route
              exact={true}
              path="/referrals/:address?"
              component={ReferralsContainer}
            />
            <Route
              exact={true}
              path="/contracts/"
              component={ViewMyContractsContainer}
            />
            <Route
              exact={true}
              path="/network/:network"
              component={SplitcoinContainer}
            />
            <Route
              exact={true}
              path="/network/:network/refer/:refer?"
              component={SplitcoinContainer}
            />
            <Route
              exact={true}
              path="/network/:network/view/:address?"
              component={SplitcoinViewContainer}
            />
            <Route
              exact={true}
              path="/network/:network/referrals/:address?"
              component={ReferralsContainer}
            />
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }
}
