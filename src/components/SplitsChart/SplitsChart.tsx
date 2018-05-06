import * as React from 'react';
import { Component } from 'react';
import { Split } from '../../types/Split';
import './SplitsChart.css';
import ChartOptions from './chart.data.js';
import { Chart, ChartData } from 'chart.js';
let pallete = require('google-palette');

type Props = {
  splits: Split[];
};
type State = {
  activeIndex: number;
};
export default class SplitsChart extends Component<Props> {
  state: State = {
    activeIndex: 0
  };
  colors: string[];
  chart: Chart;
  constructor(props: Props) {
    super(props);
    this.colors = [];
    for (let color of pallete('cb-Set3', 10)) {
      let red = color.slice(0, 2);
      let green = color.slice(2, 4);
      let blue = color.slice(4, 6);
      let rgb = `#${red}${green}${blue}`;
      this.colors.push(rgb);
    }
  }
  getInitialState() {
    return {
      activeIndex: 0
    };
  }

  componentDidMount() {
    var ctx = document.getElementById('splitChart') as HTMLCanvasElement;
    if (ctx != null) {
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: this.getDataset(),
        options: ChartOptions
      });
    }
  }

  updateChart() {
    if (this.chart) {
      this.chart.data = this.getDataset();
      this.chart.update();
      this.chart.render();
    }
  }

  getDataset() {
    let labels = this.props.splits.map(split => {
      return split.out_currency.symbol.toUpperCase();
    });
    let data = this.props.splits.map(split => {
      return split.percent;
    });
    let summation = data.reduce((sum, cur) => sum + Number(cur), 0);
    data.unshift(100 - summation);
    labels.unshift('Unallocated');
    let datasets = [{ data: data, backgroundColor: this.colors }];
    let dataset = { datasets, labels } as ChartData;
    return dataset;
  }

  render() {
    /*
     *let data = this.props.splits.map(split => {
     *  return { name: split.out_currency.name, value: split.percent };
     *});
     */

    this.updateChart();
    return (
      <div className="SplitsChart">
        <canvas id="splitChart" />
      </div>
    );
  }
}
