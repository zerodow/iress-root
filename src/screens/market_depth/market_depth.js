import React, { Component } from 'react';
import { View, Text, PixelRatio, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Swiper from 'react-native-swiper';
import MarketDepth from './swiper_market_depth';
import TenTrade from './swiper_10_trades';
import Position from './swiper_position';
import Chart from './swiper_chart';
import News from './swiper_news';
import Orders from './swiper_orders';
import { func, dataStorage } from '../../storage';
import userType from '../../constants/user_type';
import * as Animatable from 'react-native-animatable';
import * as api from '../../api';

const { height, width } = Dimensions.get('window');

export default class extends Component {
  constructor(props) {
    super(props);
        this.isMount = false;
    this.code = this.props.code || '';
    let margin = func.getUserPriceSource() !== userType.Delay ? 0 : 32;
    let ratio = PixelRatio.getFontScale() > 1 ? 52 : 0;
    this.heightChart = 0;
    this.calculatorHeightNoData = this.calculatorHeightNoData.bind(this)
    this.state = {
      checkPosition: false,
      visibleSwiper: false,
      // updated: props.updated,
      code: this.props.code || '',
      // dataChartNow: props.dataChartNow,
      initialIndex: 0,
      currentIndex: 0,
      heightButton: this.props.heightButton,
      heightIos: PixelRatio.get() < 3 ? (108 * PixelRatio.get() - (this.props.heightButton - 20) - margin - ratio) : (95 * PixelRatio.get() - margin - (this.props.heightButton - 20) - ratio),
      heightAndroid: 480,
      heightForNews: 162 + 74,
      heightForOrders: 192 + 74,
      marketOrder: this.props.marketOrder,
      heightOrderNoExpand: 49 * 4
    };
  }

  componentDidMount() {
    this.isMount = true;
    this.checkPosition(this.state.code);
    this.heightChart = this.state.marketOrder ? this.state.heightIos : this.calculatorHeightChart(this.state.marketOrder, this.state.heightButton);
    setTimeout(() => {
      this.setState({
        visibleSwiper: true
      });
    }, 500);
    this.refs && this.refs.swiper && this.refs.swiper.scrollTo && this.refs.swiper.scrollTo(this.state.initialIndex);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps &&
      (
        nextProps.code !== this.state.code ||
        nextProps.marketOrder !== this.state.marketOrder ||
        nextProps.heightButton !== this.state.heightButton
      )
    ) {
      if (nextProps.marketOrder !== this.state.marketOrder || nextProps.heightButton !== this.state.heightButton) {
        this.heightChart = nextProps.marketOrder ? this.state.heightIos : this.calculatorHeightChart(nextProps.marketOrder, nextProps.heightButton);
      }
      if (nextProps.code !== this.state.code) {
        this.checkPosition(nextProps.code);
      }
      this.setState({
        code: nextProps.code,
        marketOrder: nextProps.marketOrder,
        heightButton: nextProps.heightButton,
        heightIos: this.state.heightIos - (nextProps.heightButton - this.props.heightButton)
      });
    }
  }

  componentWillUnmount() {
    this.isMount = false;
  }

  checkPosition(code) {
    const urlUserPosition = api.getUrlUserPositionByAccountId(dataStorage.accountId);
    api.requestData(urlUserPosition, true).then(data => {
      const val = !!(data && data[code]);
      this.setState({ checkPosition: val });
    })
  }

  onIndexChanged(index, isDelay) {
    dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
    let heightAndroid = 0;
    if (index === 0 || index === 1 || (index === 5 && this.state.checkPosition)) {
      const fcb = this.props.isOrder ? func.getFuncReload('only_order') : func.getFuncReload('modify_order');
      fcb && fcb();
    }
    if (this.state.initialIndex === 3 && index !== 3) {
    }
    // if (this.state.initialIndex === 4 && index !== 4) {
    // }
    if (Platform.OS !== 'ios') {
      switch (index) {
        case 0: case 1: heightAndroid = 180 + 256; break;
        case 2: heightAndroid = 94 + 130; break;
        case 5: heightAndroid = 128 + 72; break;
        default: break;
      }
      this.setState({ heightAndroid, initialIndex: index }, this.props.setActiveDot(index));
    } else {
      this.setState({ initialIndex: index }, this.props.setActiveDot(index));
    }
  }

  calculatorHeightNews(len, isMore) {
    const moreHeight = isMore ? 16 + 27 : 0;
    const blankHeight = len === 0 ? 200 : 0;
    const heightMain = len * 32 + moreHeight + blankHeight + len * 20;
    this.setState({ heightForNews: heightMain < 200 ? 200 : heightMain });
    if (dataStorage.deviceBrand === 'lge') {
      this.setState({ heightForNews: this.state.heightForNews + 42 });
    }
  }

  calculatorHeightChart(isMarketOrder, heightButton) {
    const extra = this.props.isOrder ? 0 : 52;
    const heighOrderType = isMarketOrder ? 0 : 52;
    let heightMain = this.state.heightIos - heighOrderType - (heightButton - this.props.heightButton) + extra;
    return heightMain;
  }

  calculatorHeightOrder(len, isMore) {
    const headerHeight = 40;
    const moreHeight = isMore ? 43 : 0;
    const blankHeight = len === 0 ? 200 : 0;
    const heightMain = len * 32 + moreHeight + headerHeight + blankHeight + len * 20;
    this.setState({ heightForOrders: heightMain, heightOrderNoExpand: heightMain })
    if (PixelRatio.getFontScale() > 1.2) {
      this.setState({
        heightForOrders: this.state.heightForOrders + 32,
        heightOrderNoExpand: this.state.heightOrderNoExpand + 32
      })
    }
  }

  calculatorgetHeightHistory(len, isOpen) {
    if (isOpen) {
      const moreHeight = 43;
      const headerHeight = 40;
      const heightMain = len * 32 + 160 + moreHeight;
      // console.log('Current: ', this.state.heightForOrders);
      this.setState({ heightForOrders: heightMain + this.state.heightOrderNoExpand })
    } else {
      this.setState({ heightForOrders: this.state.heightOrderNoExpand })
    }
  }

  calculatorHeightNoData(heightAndroid) {
    this.setState({ heightAndroid });
  }

  render() {
    return (
      <View testID='newOrderSwiper' style={[styles.containerSwiper, { backgroundColor: 'white' }]}>
        {
          this.state.visibleSwiper ? <Swiper
            ref='swiper'
            index={this.state.initialIndex}
            height={Platform.OS === 'ios' ? 480 : 520}
            onIndexChanged={(index) => this.onIndexChanged(index, false)}
            scrollsToTop={true}
            loop={false}
            bounces={true}
            showsPagination={false}
            removeClippedSubviews={false}>
            <Animatable.View testID={`${this.props.testID}0`} style={styles.slide}>
              <MarketDepth
                calculatorHeightNoData={this.calculatorHeightNoData}
                code={this.state.code}
                isOrder={this.props.isOrder}
                currentIndex={this.state.initialIndex}
                isLoading={this.props.isLoading} />
            </Animatable.View>
            <View testID={`${this.props.testID}1`} style={styles.slide}>
              <TenTrade
                calculatorHeightNoData={this.calculatorHeightNoData}
                code={this.state.code}
                isOrder={this.props.isOrder}
                currentIndex={this.state.initialIndex} />
            </View>
            <View testID={`${this.props.testID}2`} style={styles.slide}>
              <Chart testID={`newOrderSwiperChart`} code={this.state.code} isLoading={this.props.isLoading} />
            </View>
            <View testID={`${this.props.testID}3`} style={styles.slide}>
              <News code={this.state.code}
                isEnabledScroll={this.props.isEnabledScroll}
                calculatorHeightNoData={this.calculatorHeightNoData}
                navigator={this.props.navigator}
                getHeightNews={this.calculatorHeightNews.bind(this)} />
            </View>
            <View testID={`${this.props.testID}4`} style={styles.slide}>
              <Orders
                // setScrollEnabled={this.props.setScrollEnabled}
                isEnabledScroll={this.props.isEnabledScroll}
                testID={`swiperWorkingOrder`}
                code={this.state.code}
                login={this.props.login}
                navigator={this.props.navigator}
                getHeightOrder={this.calculatorHeightOrder.bind(this)}
                getHeightHistory={this.calculatorgetHeightHistory.bind(this)} />
            </View>
            <View testID={`${this.props.testID}5`} style={styles.slide}>
              <Position
                testID={`swiperPosition`}
                code={this.state.code}
                isPosition={this.state.checkPosition}
                currentIndex={this.state.initialIndex}
                isLoading={this.props.isLoading} />
            </View>
          </Swiper> : <View></View>
        }
      </View>
    )
  }
}
