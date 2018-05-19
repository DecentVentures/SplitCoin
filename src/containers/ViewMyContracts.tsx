import * as React from 'react';
import { SplitcoinFactory } from '../types/Blockchain/SplitcoinFactory';
import { Card, List, Subheader, ListItem } from 'material-ui';
import Web3Component from '../components/Web3Component';
import AddressPopover from '../components/AddressPopover';
import NavBar from '../components/NavBar/NavBar';

const env = require('../config/env');
const constants = require('../config/constants');

let factoryInterface = require('../blockchain/SplitCoinContract/build/contracts/SplitCoinFactory.json');
let factory: SplitcoinFactory;

type State = {
  factoryAddr: string,
  contracts: string[],
  open: boolean,
  selectedContract?: string,
  popTarget?: Element
};

type Props = {
  network: string
};

export default class ViewMyContractsContainer extends Web3Component<Props> {
  state: State = {
    factoryAddr: '',
    contracts: [],
    open: false
  };

  async componentDidMount() {
    // Now you can start your app & access web3 freely:
    await super.componentDidMount();
    let network = this.getNetwork();
    let factoryAddr = network
      ? env[network].SPLITCOIN_FACTORY.active
      : constants.SPLITCOIN_FACTORY;
    // default to the main net if theres no address
    factoryAddr = factoryAddr || env.main.SPLITCOIN_FACTORY.active;
    await this.updateFactory(factoryAddr);
    const contracts = await this.getDeployedSplits();
    this.setState({ contracts });
  }

  async updateFactory(address: string) {
    this.setState({ factoryAddr: address });
    factory = new this.web3.eth.Contract(factoryInterface.abi, address);
  }

  async getDeployedSplits() {
    let account = await this.getAccount();
    let getContract = (i: number) =>
      factory.methods.contracts(account, i).call({
        from: account
      });
    let contracts = await this.unrollWeb3Array(getContract, '0x0');
    /*
     *try {
     *  let contract = await getContract(index);
     *  while (contract) {
     *    contracts.push(contract);
     *    index++;
     *    contract = await getContract(index);
     *  }
     *} catch (ex) {}
     */
    return Promise.all(contracts);
  }

  contractClick(contract: string) {
    return (event: React.MouseEvent<Element>) => {
      event.preventDefault();
      this.setState({
        open: true,
        selectedContract: contract,
        popTarget: event.currentTarget
      });
    };
  }

  handlePopClose() {
    this.setState({ open: false });
  }

  render() {
    const contracts = this.state.contracts || [];
    const ContractList = contracts.map(contract => (
      <ListItem key={contract} onClick={this.contractClick(contract)}>
        {contract}
      </ListItem>
    ));

    return (
      <div className="App">
        <NavBar />
        <Card>
          <List>
            <Subheader>Deployed Contracts</Subheader>
            {ContractList}
          </List>
          <AddressPopover
            network={this.props.network}
            open={this.state.open}
            onClose={this.handlePopClose}
            anchorEl={this.state.popTarget}
            address={this.state.selectedContract}
            match={this.props.match}
            location={this.props.location}
            history={this.props.history}
          />
        </Card>
      </div>
    );
  }
}
