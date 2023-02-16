import React, { Component } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { formatNumber, formatNumberNew2, countC2RTimes, largeValue } from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import HighLightText from '../../modules/_global/HighLightText';
import { func, dataStorage } from '../../storage';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';

export default class Position extends Component {
  constructor(props) {
    super(props);
        this.code = this.props.code || '';
    this.getDataPosition = this.getDataPosition.bind(this);
    this.state = {
      isPosition: this.props.isPosition || false,
      listData: [],
      currentIndex: this.props.currentIndex || 5
    }
    this.perf = new Perf(performanceEnum.show_swiper_position);
  }

  getDataPosition() {
    this.perf = new Perf(performanceEnum.get_data_position);
    this.perf && this.perf.start();
    const urlPosition = api.getUrlPositionByAccountId(dataStorage.accountId, this.code);
    api.requestData(urlPosition, true).then(val => {
      const listData = [];
      let trend = 0;
      if (val) {
        switch (val.trend) {
          case 'None': trend = 0; break;
          case 'Up': trend = 1; break;
          case 'Down': trend = -1; break;
          default: trend = 0;
        }
        listData.push({
          volume: val.volume,
          avr_price: val.average_price,
          market_price: val.market_price,
          value: val.value,
          fees: val.fees,
          upnl: val.upnl || 0,
          trend
        });
      } else {
        listData.push({
          volume: 0,
          trend
        });
      }
      this.setState({
        listData
      }, () => {
        this.perf && this.perf.stop();
      });
    });
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.code && nextProps.code !== this.code)) {
      this.code = nextProps.code || '';
      if (nextProps.isPosition) {
        this.getDataPosition();
      } else {
        this.setState({ listData: [{ volume: 0 }] });
      }
    } else {
      if (nextProps.currentIndex === 5 && nextProps.currentIndex !== this.state.currentIndex) {
        if (nextProps.isPosition) {
          this.getDataPosition();
        } else {
          this.setState({ listData: [{ volume: 0 }] });
        }
      }
    }
    this.setState({ currentIndex: nextProps.currentIndex });
  }

  componentDidMount() {
    if (this.state.isPosition) {
      this.getDataPosition();
    } else {
      this.setState({ listData: [{ volume: 0 }] });
    }
  }

  renderHeader() {
    return (
      <View style={[styles.header2, { flexDirection: 'column' }]}>
        <View style={styles.headerContainer}>
          <Text testID={`${this.props.testID}VolumeLabel`} style={[styles.col31, CommonStyle.textMainHeader]}>{I18n.t('quantityUpper')}</Text>
          <Text testID={`${this.props.testID}MktPriceLabel`} style={[styles.col32, CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('mktPriceUpper')}</Text>
          <Text testID={`${this.props.testID}ValueLabel`} style={[styles.col33, CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('valueUpper')}</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text testID={`${this.props.testID}FeesLabel`} style={[styles.col31, CommonStyle.textSubHeader]}>{I18n.t('feesUpper')}</Text>
          <Text testID={`${this.props.testID}AvrLabel`} style={[styles.col32, CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('avgPriceUpper')}</Text>
          <Text testID={`${this.props.testID}UpnlLabel`} style={[styles.col33, CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('upnl')}</Text>
        </View>
      </View>
    )
  }

  renderContent(data, index) {
    return (
      <View
        key={index} style={{ flexDirection: 'column', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 4 }}>
        <View style={styles.headerContainer}>
          <HighLightText
            testID={`${this.props.testID}VolumeValue`}
            style={[styles.col31, CommonStyle.textMainNoColor]}
            base={data.volume ? formatNumber(data.volume) : 0}
            value={data.volume ? formatNumber(data.volume) : 0} />

          <HighLightText style={[styles.col32, CommonStyle.textMainNoColor, { textAlign: 'right' }]}
            testID={`${this.props.testID}MktPriceValue`}
            base={data.trend}
            value={this.props.isLoading ? null : (data.market_price || data.volume ? (data.market_price ? formatNumberNew2(data.market_price, 3) : '--') : '')} />
          <Text testID={`${this.props.testID}Value`} style={[styles.col33, CommonStyle.textMain, { textAlign: 'right' }]}>{this.props.isLoading ? '--' : (data.value || data.volume ? (data.value ? formatNumberNew2(data.value, 2) : '--') : '')}</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text testID={`${this.props.testID}FeesValue`} style={[styles.col31, CommonStyle.textSub]}>{(data.fees || data.volume) ? (data.fees !== null && data.fees !== undefined ? formatNumberNew2(data.fees, 2) : '--') : ''}</Text>
          <Text testID={`${this.props.testID}AvrPriceValue`} style={[styles.col32, CommonStyle.textSub, { textAlign: 'right' }]}>{data.avr_price || data.volume ? (data.avr_price !== null && data.avr_price !== undefined ? formatNumberNew2(data.avr_price, 3) : '--') : ''}</Text>
          <HighLightText style={[styles.col33, CommonStyle.textSubNoColor, { textAlign: 'right' }]}
            testID={`${this.props.testID}UPnLValue`}
            addSymbol
            base={formatNumberNew2(data.upnl, 2)}
            value={this.props.isLoading ? null : (data.upnl || data.volume ? formatNumberNew2(data.upnl, 2) : '')}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <ScrollView onTouchStart={() => {
        if (this.state.listData.length <= 7) {
        } else {
          dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(false);
        }
      }}
        onMomentumScrollEnd={(e) => dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true)}
        onScrollEndDrag={(e) => dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true)}>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {this.renderHeader()}
          {
            this.state.listData.map((e, i) => {
              return (
                this.renderContent(e, i)
              );
            })
          }
        </View>
      </ScrollView>
    );
  }
}
