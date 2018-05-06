import * as React from 'react';
import { Component } from 'react';
import SplitView from './SplitView';
import { Split } from '../types/Split';
import { Table, TableBody } from 'material-ui';
import { RouteComponentProps } from 'react-router';

type Props = {
  network: string;
  removeSplit?: (split: Split) => {};
  splits: Split[];
  claimable: boolean;
  onClaim?: (split: Split) => {};
  onRemove?: (split: Split) => void;
} & RouteComponentProps<any>;
export default class SplitList extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.removeSplit = this.removeSplit.bind(this);
    this.claim = this.claim.bind(this);
  }

  removeSplit(split: Split) {
    let emptyFn = () => {};
    return () => (this.props.onRemove ? this.props.onRemove(split) : emptyFn);
  }

  claim(split: Split) {
    let emptyFn = () => {};
    return () => (this.props.onClaim ? this.props.onClaim(split) : emptyFn);
  }

  render() {
    const styles = {
      table: {
        flex: '0 0 50%',
        marginTop: '30px',
        marginBottom: '30px'
      },
      empty: {
        marginTop: '30px',
        marginBottom: '30px',
        backgroundColor: 'rgba(200, 173, 44, .2)',
        borderTopStyle: 'solid',
        color: 'rgba(0, 0, 0, 0.5)',
        borderTopColor: 'rgba(200, 173, 44, .2)'
      }
    };
    let removeFn = this.props.onRemove ? this.removeSplit : undefined;
    let claimFn = this.props.onClaim ? this.claim : undefined;
    let splits = this.props.splits.map(split => (
      <SplitView
        network={this.props.network}
        key={split.to + split.out_currency.name}
        split={split}
        removeSplit={removeFn}
        onClaim={claimFn}
        claimable={this.props.claimable}
        match={this.props.match}
        location={this.props.location}
        history={this.props.history}
      />
    ));

    let table = (
      <Table style={styles.table}>
        <TableBody displayRowCheckbox={false}>{splits}</TableBody>
      </Table>
    );
    let empty = <div style={styles.empty}> Please add some outputs </div>;

    let content = splits.length ? table : empty;

    return content;
  }
}
