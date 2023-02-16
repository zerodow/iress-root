import React, { Component } from 'react';
import { View, Text, ScrollView, PixelRatio, Platform, TouchableOpacity } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';
import HighLightText from '../../modules/_global/HighLightText';
import { func, dataStorage } from '../../storage';
import { addDaysToTime, addMonthsToTime } from '../../lib/base/dateTime';
import ProgressBar from '../../modules/_global/ProgressBar';
import filterType from '../../constants/filter_type';
import { logAndReport, logDevice, deleteNotiOrderByCode, getOrderIdByType } from '../../lib/base/functionUtil';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import orderState from '../../constants/order_state';

const Tag = {
  WORKING: 'open',
  STOPLOSS: 'stoploss',
  FILLED: 'filled',
  CANCELLED: 'cancelled'
}

export class WorkingOrder extends Component {
  constructor(props) {
    super(props);
    this.code = this.props.code || '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const newDate = new Date(year, month, date);
    const nextDate = addDaysToTime(newDate, 1);
    this.startTime = addMonthsToTime(newDate, -1).getTime();
    this.endTime = nextDate.getTime();
    this.getOrders = this.getOrders.bind(this);
    this.userId = func.getUserId();
    this.register = {};
    this.dicGetHistChart = {};
    this.lastCode = '';
    this.registerChange = this.registerChange.bind(this);
    this.changeIndex = this.changeIndex.bind(this);
    this.quantity = 11;
    this.listFilled = [];
    this.listCancelled = [];
    this.listFillCancel = [];
    this.dataLevel = 1;
    this.state = {
      scrollEnabled: !this.props.isEnabledScroll || false,
      listData: [],
      isLoading: true,
      isLoadMore: true,
      isMore: false
    }
    this.perf = new Perf(performanceEnum.show_swiper_orders);
    dataStorage.setScrollEnabledSwiperOrder = this.setScrollEnabledSwiperOrder.bind(this)
  }

  setScrollEnabledSwiperOrder(boolean) {
    this.setState({ scrollEnabled: boolean });
  }

  getDataLevel2() {
    try {
      this.perf = new Perf(performanceEnum.get_data_level_2);
      this.perf && this.perf.start();
      const orderUrl = api.getUrlOrderByTag(Tag.STOPLOSS, dataStorage.accountId);
      api.requestData(orderUrl, true).then(data => {
        let listData = [];
        if (data && data.length) {
          for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.symbol === this.code) {
              listData.push(element);
            }
          }
        }
        listData = listData.sort(function (a, b) {
          return b.init_time - a.init_time;
        })
        listData = [...this.listWorking, ...listData];
        listData = listData.slice(0, this.quantity);
        let isMore = false;
        if (listData.length > (this.quantity - 1)) {
          isMore = true;
          listData.pop();
          this.props.getHeightOrder && this.props.getHeightOrder(listData.length, isMore);
          this.setState({ listData, isLoading: false, isMore, isLoadMore: false }, () => {
            const accountId = dataStorage.accountId;
            deleteNotiOrderByCode(Tag.STOPLOSS, this.code, accountId);
            this.perf && this.perf.stop();
          })
        } else {
          this.dataLevel = 3;
          this.listWorking = listData;
          this.getDataLevel3();
        }
      })
    } catch (error) {
      logDevice('info', `Swiper Orders get data level 2 exception: ${error}`)
    }
  }

  getDataLevel3() {
    try {
      const orderUrl = api.getUrlOrderByTag(Tag.FILLED, dataStorage.accountId, this.startTime, this.endTime);
      api.requestData(orderUrl, true).then(data => {
        let listData = [];
        if (data && data.length) {
          for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.symbol === this.code) {
              listData.push(element);
            }
          }
        }
        listData = listData.sort(function (a, b) {
          return b.init_time - a.init_time;
        })
        listData = [...this.listWorking, ...listData];
        listData = listData.slice(0, this.quantity);
        let isMore = false;
        if (listData.length > (this.quantity - 1)) {
          isMore = true;
          listData.pop();
          this.props.getHeightOrder && this.props.getHeightOrder(listData.length, isMore);
          this.setState({ listData, isLoading: false, isMore, isLoadMore: false }, () => {
            const accountId = dataStorage.accountId;
            deleteNotiOrderByCode(Tag.FILLED, this.code, accountId);
            this.perf && this.perf.stop();
          });
        } else {
          this.dataLevel = 4;
          this.listWorking = listData;
          this.getDataLevel4();
        }
      })
    } catch (error) {
      logDevice('info', `Swiper Orders get data level 3 exception: ${error}`)
    }
  }

  getDataLevel4() {
    try {
      const orderUrl = api.getUrlOrderByTag(Tag.CANCELLED, dataStorage.accountId, this.startTime, this.endTime);
      api.requestData(orderUrl, true).then(data => {
        let listData = [];
        if (data && data.length) {
          for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.symbol === this.code) {
              listData.push(element);
            }
          }
        }
        listData = listData.sort(function (a, b) {
          return b.init_time - a.init_time;
        })
        listData = [...this.listWorking, ...listData];
        listData = listData.slice(0, this.quantity);
        let isMore = false;
        if (listData.length) {
          if (listData.length > (this.quantity - 1)) {
            isMore = true;
            listData.pop();
            this.props.getHeightOrder && this.props.getHeightOrder(listData.length, isMore);
          }
          this.setState({ listData, isLoading: false, isMore, isLoadMore: false }, () => {
            const accountId = dataStorage.accountId;
            deleteNotiOrderByCode(Tag.CANCELLED, this.code, accountId);
            this.perf && this.perf.stop();
          });
        } else {
          this.dataLevel = 5; // stop
          this.setState({ listData: [], isLoading: false, isMore: false, isLoadMore: false });
        }
      })
    } catch (error) {
      logDevice('info', `Swiper Orders get data level 4 exception: ${error}`)
    }
  }

  getOrders() {
    try {
      this.perf = new Perf(performanceEnum.get_orders);
      this.perf && this.perf.start();
      const orderUrl = api.getUrlOrderByTag(Tag.WORKING, dataStorage.accountId);
      api.requestData(orderUrl, true).then(data => {
        let listData = [];
        if (data && data.length === 0) {
          this.setState({ listData, isLoading: false, isMore: false, isLoadMore: false }, () => {
            this.perf && this.perf.stop();
          })
        }
        if (data && data.length) {
          for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.symbol === this.code) {
              listData.push(element);
            }
          }
        }
        listData = listData.sort(function (a, b) {
          return b.init_time - a.init_time;
        })
        listData = listData.slice(0, this.quantity);
        let isMore = false;
        if (listData.length > (this.quantity - 1)) {
          isMore = true;
          listData.pop();
          this.setState({ listData, isLoading: false, isMore, isLoadMore: false }, () => {
            const accountId = dataStorage.accountId;
            deleteNotiOrderByCode('working', this.code, accountId);
            this.perf && this.perf.stop();
          })
        } else {
          this.dataLevel = 2;
          this.listWorking = listData;
          this.getDataLevel2();
        }
      })
    } catch (error) {
      logDevice('info', `Swiper Orders get orders exception: ${error}`)
    }
  }

  componentDidMount() {
    this.getOrders();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.code !== this.code) {
      this.code = nextProps.code || '';
      this.getOrders();
    }
  }

  renderHeader() {
    return (
      <View style={[styles.header2, { flexDirection: 'column' }]}>
        <View style={styles.headerContainer}>
          <Text testID={`${this.props.testID}SymbolLabel`} style={[styles.col51, CommonStyle.textMainHeader]}>{I18n.t('symbolUpper')}</Text>
          <Text testID={`${this.props.testID}SizeLabel`} style={[styles.col52, CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('quantityUpper')}</Text>
          <Text testID={`${this.props.testID}LimitPriceLabel`} style={[styles.col53, CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('limitPriceUpper')}</Text>
          <Text testID={`${this.props.testID}FilledPriceLabel`} style={[styles.col54, CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('FilledPriceUpper')}</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text testID={`${this.props.testID}SideLabel`} style={[styles.col51, CommonStyle.textSubHeader]}>{I18n.t('sideUpper')}</Text>
          <Text testID={`${this.props.testID}FilledLabel`} style={[styles.col52, CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('FilledUpper')}</Text>
          <Text testID={`${this.props.testID}StopPriceLabel`} style={[styles.col53, CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('stopPriceUpper')}</Text>
          <Text testID={`${this.props.testID}DurationLabel`} style={[styles.col54, CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('DurationUpper')}</Text>
        </View>
      </View>
    );
  }

  registerChange(code, cb, getDataHistory) {
    this.register[code] = cb;
    this.dicGetHistChart[code] = getDataHistory;
  }

  changeIndex(code, isOpen, len) {
    try {
      this.props.getHeightHistory && this.props.getHeightHistory(len, isOpen);
      const cb = this.register[code];
      if (cb) {
        const preCode = this.lastCode;
        if (isOpen) {
          this.lastCode = code;
        } else {
          this.lastCode = '';
        }
        cb(isOpen);
        if (preCode !== code) {
          const preCb = this.register[preCode];
          if (preCb) preCb(false)
        }
      }
    } catch (error) {
      console.log('changeIndex swiper_order logAndReport exception: ', error)
      logAndReport('changeIndex swiper_order exception', error, 'changeIndex working');
      logDevice('info', `changeIndex swiper_order exception ${error}`);
    }
  }

  loadMore() {
    this.quantity += 10;
    this.setState({ isLoadMore: true }, () => {
      switch (this.dataLevel) {
        case 1:
          this.getOrders();
          break;
        case 2:
          this.getDataLevel2();
          break;
        case 3:
          this.getDataLevel3();
          break;
        case 4:
          this.getDataLevel4();
          break;
        default:
          break;
      }
    });
  }

  getFilterType(data) {
    if (data && data.order_state) {
      const state = (data.order_state + '').toUpperCase();
      switch (state) {
        case orderState.CANCELLED:
        case orderState.CANCELED:
        case orderState.REJECTED: return filterType.CANCELLED;
        case orderState.FILLED: return filterType.FILLED;
        default:
          if (data.is_stoploss) {
            return filterType.STOPLOSS;
          } else {
            return filterType.WORKING;
          }
      }
    }
  }

  _beginDrag() {
    // console.log('_beginDrag')
    // this.props.scrollEnabled(false);
    // this.setState({ isEnabledScroll: true });
  }

  _endDrag() {
    this.setState({ scrollEnabled: false }, () => {
      dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
    })
  }

  render() {
    const loading = (
      <View style={{
        backgroundColor: 'white',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ProgressBar />
      </View>);
    if (this.state.isLoading) {
      return loading;
    }
    let scrollEnabled = Platform.OS === 'ios' ? true : this.state.scrollEnabled;
    return (
      <ScrollView onTouchStart={() => {
        if (this.state.listData.length <= 7) {
          if (dataStorage.isExpanded) {
            dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(false);
          }
        } else {
          dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(false);
        }
      }}
        onMomentumScrollEnd={(e) => {
          dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
        }}
        onScrollEndDrag={(e) => {
          dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
        }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 72 }}>
          {this.renderHeader()}
          {
            this.state.listData.map((e, i) => {
              const orderId = getOrderIdByType(e);
              let type = this.getFilterType(e);
              return (<View style={{ width: '100%' }} key={orderId}>
                <View style={[CommonStyle.borderBelow, { marginHorizontal: 16 }]}></View>
              </View>)
            })
          }
          {
            this.state.isLoading ? <ProgressBar /> : (
              this.state.isMore ? <TouchableOpacity onPress={this.loadMore.bind(this)}
                style={[styles.rowExpandNews, { width: '100%' }]}>
                <Text style={{ fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontBlue }}>{I18n.t('more')}</Text>
              </TouchableOpacity> : null)
          }
          <View style={{ height: 72 }}></View>
        </View>
      </ScrollView>
    );
  }
}

export default WorkingOrder;
