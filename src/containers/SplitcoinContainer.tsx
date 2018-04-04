import * as React from 'react';
import { Split } from '../types/Split';
import { Currency } from '../types/Currency';
import { Ether } from '../types/Currency';
import SplitCreate from '../components/SplitCreate';
import Metamask from '../components/Metamask';
import SplitList from '../components/SplitList';
import SplitNav from '../components/SplitNav';
import { CardHeader } from 'material-ui';
import { CardActions } from 'material-ui';
import { FlatButton, Dialog, Card } from 'material-ui';
import {  Toggle } from 'material-ui';
import DeployDialogButton from '../components/DeployDialogButton';
import Web3Component from '../components/Web3Component';

let request = require('request-promise');
let constants = require('../config/constants');
let env = require('../config/env');
let factoryInterface = require('../blockchain/SplitCoinContract/build/contracts/SplitCoinFactory.json');

let factory: any = null;

type State = {
  deployed: string,
  message: string,
  deployedContracts: string[],
  depositCurrency: Currency,
  factoryAddr?: string,
  splits: Split[],
  returnAddr: string,
  referAddr: string,
  withdrawalMode: boolean
}
export default class SplitcoinContainer extends Web3Component<any> {

  devSplit: Split = {
    to: 'splitcoin_dev_fee',
    out_currency: Ether,
    percent: .1
  };

  public state: State = {
    depositCurrency: Ether,
    splits: [],
    returnAddr: '',
    referAddr: '',
    deployedContracts: [],
    deployed: '',
    message: '',
    withdrawalMode: true
  }

  constructor(props: any) {
    super(props);
    this.createSplit = this.createSplit.bind(this);
    this.deploySplits = this.deploySplits.bind(this);
    this.currencyChange = this.currencyChange.bind(this);
    this.depositTypeChange = this.depositTypeChange.bind(this);
    this.unallocatedPercent = this.unallocatedPercent.bind(this);
    this.removeSplit = this.removeSplit.bind(this);
    this.onReturnAddrUpdate = this.onReturnAddrUpdate.bind(this);
    this.onFactoryUpdate = this.onFactoryUpdate.bind(this);
    this.setFactoryAddr = this.setFactoryAddr.bind(this);
    this.startDeploy = this.startDeploy.bind(this);
    this.generateReferContract = this.generateReferContract.bind(this);
    this.populateReferAddr = this.populateReferAddr.bind(this);
    this.updateFactory = this.updateFactory.bind(this);
  }

  onFactoryUpdate(event: any) {
    return this.updateFactory(event.target.value);
  }

  async updateFactory(factoryAddr: string) {
    await this.setFactoryAddr(factoryAddr);
    try {
      if (factoryAddr != '') {
        factory = new this.web3.eth.Contract(factoryInterface.abi, factoryAddr);
        await this.populateDeployedSplits();
        await this.populateReferAddr();
      }
    } catch (e) {
      console.warn(e);
      console.warn('Error connecting to SplitCoin... make sure you have MetaMask set to the correct network');
      if (this.getNetwork()) {
        this.setState({
          message: 'Error connecting to SplitCoin... make sure you have MetaMask set to the correct network'
        });
      }
    }
  }

  setFactoryAddr(addr: string) {
    return this.setState({
      factoryAddr: addr
    });
  }

  async populateReferAddr() {
    let account = await this.getAccount();
    let referContract = await factory.methods.referralContracts(account).call({
      from: account
    });
    if (referContract > 0) {
      return this.setState({
        referAddr: account
      });
    }

  }
  populateDeployedSplits() {
    return this.getDeployedSplits()
      .then(async (resolvedContracts) => {
        this.onDeployedContractsUpdate(resolvedContracts);
      });
  }

  async getDeployedSplits() {
    let index = 0;
    let account = await this.getAccount();
    let getContract = (index: number) => factory.methods.contracts(account, index)
      .call({
        from: account
      });
    let contracts = [];
    try {
      let contract = await getContract(index);
      while (contract) {
        contracts.push(contract);
        index++;
        contract = await getContract(index);
      }
    } catch (ex) {}
    return Promise.all(contracts)
  }

  onDeployedContractsUpdate(deployedContracts: string[]) {
    this.setState({
      deployedContracts
    });
  }

  async componentDidMount() {
    // Now you can start your app & access web3 freely:
    await super.componentDidMount();
    let network = this.getNetwork();
    let factoryAddr = network ? env[network].SPLITCOIN_FACTORY.active : constants.SPLITCOIN_FACTORY;
    //default to the main net if theres no address
    factoryAddr = factoryAddr || env.main.SPLITCOIN_FACTORY.active;
    await this.updateFactory(factoryAddr);
  }

  createSplit(split: Split) {
    let index = this.state.splits.findIndex((cur) => {
      return cur.to == split.to && cur.out_currency == split.out_currency;
    });
    let splits = this.state.splits;
    if(index > -1) {
      splits[index].percent += split.percent;
    } else {
      splits.push(split);
    }
    this.setState((state: State) => ({
      splits: splits
    }));
  }

  startDeploy() {
    this.setState((state) => ({
      deployed: ''
    }));
  }

  async generateReferContract() {
    let account = await this.getAccount();
    let refer = this.props.match.params.refer;
    return factory.methods.generateReferralAddress(refer)
      .send({
        from: account
      })
      .then((instance: any) => this.updateDeployedContracts(instance))
      .catch((err: any) => {
        console.warn(err);
        this.setState({
          deployed: 'ERROR'
        });
      });
  }


  async updateDeployedContracts(instance: any) {
    let deployedContracts = instance.events.Deployed.returnValues[0] as string;
    this.setState({
      deployed: deployedContracts
    });
    this.onDeployedContractsUpdate(this.state.deployedContracts.concat(deployedContracts));
    return deployedContracts;
  }

  async deploySplits() {
    let refer = this.props.match.params.refer;
    let returnAddr = this.state.returnAddr;
    const million = 1000000;
    let splits = this.state.splits;
    for (let split of splits) {
      if (split.out_currency.symbol !== Ether.symbol) {
        let resp = await this.generateShiftAddress(Ether, split.out_currency, split.to);
        split.eth_address = resp.deposit;
        if (resp.error) {
          this.setState(({
            message: 'Error creating Shapeshift address, please wait a couple of minutes and then try again',
            deployed: 'ERROR'
          }));
          return Promise.reject('Shapeshift Integration Failed');
        }
      } else {
        split.eth_address = split.to;
      }
    }

    let addresses = splits.map((split) => split.eth_address);
    let partsPerMill = splits.map((split) => split.percent / 100 * million);

    let account = await this.getAccount();
    return factory.methods.make(addresses, partsPerMill, refer, this.state.withdrawalMode)
      .send({
        from: account
      })
      .then(async (instance: any) => {
        let splitCoinAddr = await this.updateDeployedContracts(instance);
        if (this.state.depositCurrency.symbol != Ether.symbol) {
          let resp = await this.generateShiftAddress(this.state.depositCurrency, Ether, splitCoinAddr, returnAddr);
          if (resp.error) {
            this.setState(({
              message: 'Error creating input converter with Shapeshift... Try and create an address that sends to the smart contract.',
            }));
          } else {
            this.setState(({
              message: `You can send ${this.state.depositCurrency.name} to ${resp.deposit}`,
            }));
          }
        }
      }).catch((err: any) => {
        console.warn(err);
        this.setState({
          deployed: 'ERROR'
        });
      });
  }

  async generateShiftAddress(from: Currency, to: Currency, toAddr: string, returnAddr?: string) {
    let shiftData = {
      url: 'https://cors.shapeshift.io/shift',
      json: true,
      form: {
        withdrawal: toAddr,
        reusable: true,
        pair: from.symbol + '_' + to.symbol,
        apiKey: constants.SHAPESHIFT_PUB_KEY,
        returnAddress: ''
      }
    };
    if (returnAddr) {
      shiftData.form.returnAddress = returnAddr;
    }
    return request.post(shiftData).then((data: any) => JSON.parse(data));
  }

  depositTypeChange(currency: Currency) {
    if (currency.symbol != Ether.symbol) {
      this.setState((state) => ({
        withdrawalMode: true
      }));
    }
    this.setState({
      depositCurrency: currency
    });
  }

  onReturnAddrUpdate(event: any) {
    this.setState({
      returnAddr: event.target.value
    });
  }


  currencyChange(currency: Currency) {
    //console.log(currency);
  }

  unallocatedPercent() {
    let percents = this.state.splits.reduce((sum, split) => {
      return sum + split.percent;
    }, 0.0);
    return Number((100.0 - percents).toFixed(1));
  }

  removeSplit(split: Split) {
    let index = this.state.splits.indexOf(split);
    let splits = this.state.splits.slice();
    splits.splice(index, 1);
    this.setState({
      splits
    });
  }

  toggleWithdrawMode = () => {
    this.setState((state: State) => ({
      withdrawalMode: !state.withdrawalMode
    }));
  }

  render() {
    const styles = {
      card: {
        width: '50%',
        margin: '0 auto',
        marginTop: '15px'
      },
      header: {
        paddingRight: '0px'
      },
      toggle: {
        maxWidth: '250px',
        marginLeft: 'auto',
        marginRight: '0',
        fontSize: 'small',
        textAlign: 'right'

      },
      referalDiv: {
        marginRight: '0',
        marginLeft: 'auto',
        maxWidth: '300px',
        color: 'white'
      },
      referalLnk: {
        color: 'white'
      }
    }

    return (
      <div className="App">
      <div className="header">
      <Metamask open={!this.hasWeb3} />
      <Dialog
      title="Uh-oh..."
      modal={false}
      open={this.state.message != ''}>
      <div>{this.state.message}</div>
      </Dialog>

      <div style={styles.referalDiv}>
      {this.state.referAddr != '' ? <FlatButton style={styles.referalLnk} href={`/refer/${this.state.referAddr}`} label="Referral Link"/>
        : <DeployDialogButton  label="Generate Referral Contract" disabled={false} deployed={this.state.deployed} onStart={this.startDeploy} onAgree={this.generateReferContract}/>}
      </div>
      </div>
      <div className="content App-intro">
      <div>
      <SplitNav
      contracts={this.state.deployedContracts}
      network={this.getNetwork()}
      match={this.props.match}
      location={this.props.location}
      history={this.props.history}
      />
      <Card>
      <CardHeader style={styles.header} title="Splitcoin" subtitle="Income automation, powered by Ethereum" avatar={Ether.imageSmall} />
      <h3>Select Outputs</h3>
      <SplitCreate unallocatedPercent={this.unallocatedPercent()} onCurrencyChange={this.currencyChange} onCreate={this.createSplit}/>
      <SplitList claimable={false} splits={this.state.splits} onRemove={this.removeSplit} network={this.getNetwork()}
      match={this.props.match} history={this.props.history} location={this.props.location}/>
      <CardActions>
      <DeployDialogButton disabled={this.state.splits.length <= 0 || !this.hasWeb3} deployed={this.state.deployed} onStart={this.startDeploy} onAgree={this.deploySplits}/>
      <Toggle label={this.state.withdrawalMode ? "Receiver pays gas" : "Sender pays gas" }
      onToggle={this.toggleWithdrawMode} toggled={this.state.withdrawalMode} style={styles.toggle} />
      </CardActions>
      </Card>
      </div>
      </div>
      </div>
    );
  }
}
