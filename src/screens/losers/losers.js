import React, { Component } from 'react';
import { Text, View, PixelRatio } from 'react-native';
import firebase from '../../firebase';
import styles from './style/losers';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import FirebaseManager from '../../lib/base/firebase_manager';
import ProgressBar from '../../modules/_global/ProgressBar';
import { logAndReport } from '../../lib/base/functionUtil';
import TopPrice from '../../component/topprice/top_price';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';

export default class MarketCaps extends Component {
  constructor(props) {
    super(props);
        this.label = ['Code', 'Last', 'Change', '% Change']
    this.listSymbol = [];
    this.list = [];
    this.firebaseManager = new FirebaseManager();
    this.state = {
      listData: []
    }
    this.dataUserWatchListChange = this.dataUserWatchListChange.bind(this);
    this.perf = new Perf(performanceEnum.show_form_losers);
  }

  componentDidMount() {
    this.perf && this.perf.incrementCounter(performanceEnum.show_form_losers);
    setCurrentScreen(analyticsEnum.losers)
    this._retrieveTradeList();
  }

  changedValue(val) {
    for (let i = 0; i < this.list.length; i++) {
      let obj = this.list[i];
      if (obj.code === val.key) {
        if (val._value) {
          obj = val._value;
          this.list[i] = obj;
        }
        break;
      }
    }
    const listData = JSON.parse(JSON.stringify(this.list));
    this.setState({
      listData: listData
    });
  }

  dataUserWatchListChange(data) {
    try {
      const listData = [];
      for (const keyCode in data._value) {
        listData.push(data._value[keyCode]);
      }
      this.listSymbol = listData;
      this.list = [];
      const listDataSource = [];
      for (let i = 0; i < this.listSymbol.length; i++) {
        const symbol = this.listSymbol[i];
        if (!symbol) continue;
        listDataSource.push({ code: symbol });
        this.firebaseManager.register('price/' + symbol, this.changedValue.bind(this));
      }
      this.list = listDataSource;
    } catch (error) {
      console.log('dataUserWatchListChange losers logAndReport exception: ', error)
      logAndReport('dataUserWatchListChange losers exception', error, 'dataUserWatchListChange losers');
    }
  }

  _retrieveTradeList() {
    this.firebaseManager = new FirebaseManager();
    this.firebaseManager.register('top_price_loser', this.dataUserWatchListChange);
  }

  render() {
    if (this.state.listData.length > 0) {
      return (
        <TopPrice
          label={this.label}
          data={this.state.listData}
          value1='code' value2='trade_price'
          value3='change_point' value4='change_percent' />
      );
    } else {
      return (
        <View style={CommonStyle.progressBarBlue}>
          <ProgressBar />
        </View>
      );
    }
  }
}
