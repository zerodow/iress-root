import React, { Component } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform, TouchableOpacity, FlatList } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
  formatNumber, getPriceSource, logAndReport, logDevice,
  deleteNotiNewsByCode, showNewsDetail
} from '../../lib/base/functionUtil';
import config from '../../config';
import {
  getDateStringWithFormat, convertToDate, getDateOnly, getMonthBetween,
  addDaysToTime
} from '../../lib/base/dateTime';
import moment from 'moment';
import firebase from '../../firebase';
import I18n from '../../modules/language/';
import { func, dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import RowData from './row_news';
import RowNews from '../news/row_news';
import time from '../../constants/time';
import { getFeedUrl, getNewsUrl, requestData } from '../../api';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as util from '../../util';
import * as Controller from '../../memory/controller'

export class SwipNews extends Component {
  constructor(props) {
    super(props);
        this.code = this.props.code || '';
    this.getDataNews = this.getDataNews.bind(this);
    this.quantity = 6;
    this.state = {
      scrollEnabled: !this.props.isEnabledScroll || false,
      listData: [],
      isLoading: true,
      isLoadMore: false,
      isMore: false
    };
    this.renderToLink = this.renderToLink.bind(this);
    this.perf = new Perf(performanceEnum.show_swiper_news);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.code && (nextProps.code !== this.code)) {
      this.code = nextProps.code || '';
      this.getDataNews();
    }
  }

  componentDidMount() {
    this.getDataNews();
  }

  getDataNews() {
    try {
      this.perf = new Perf(performanceEnum.get_data_news);
      this.perf && this.perf.start();
      let listData = [];
      const newTxt = util.encodeSymbol(this.code);
      let url = `${getNewsUrl()}${newTxt}&top=${this.quantity}`;
      requestData(url).then(data => {
        const listObj = data || {};
        for (let i = 0; i < listObj.length; i++) {
          let element = listObj[i];
          const now = new Date().getTime();
          const changeTime = now - element.updated;
          if (changeTime < time.ONE_WEEK) {
            listData.push(element);
          }
        }
        listData = listData.sort(function (a, b) {
          return b.updated - a.updated;
        })
        let isMore = false;
        if (listData.length > (this.quantity - 1)) {
          isMore = true;
          listData.pop();
        }
        this.props.getHeightNews && this.props.getHeightNews(listData.length, isMore);
        this.setState({ listData, isLoading: false, isMore, isLoadMore: false }, () => {
          this.perf && this.perf.stop();
          deleteNotiNewsByCode(this.code);
        })
      })
    } catch (error) {
      logDevice('info', `Swiper News get data news exception: ${error}`)
    }
  }

  renderToLink(data) {
    const newID = data.news_id || ''
    showNewsDetail(newID, this.props.navigator, this.props.isConnected);
  }

  renderRow(item) {
    let check = false;
    if (Controller.getLoginStatus()) {
      const listUnread = dataStorage.list_news_unread || {};
      const check = listUnread[item.news_id];
    }
    return (
      <RowNews unread={!!check} key={item.news_id} testID='RowNewsSwiper' data={item} renderToLink={this.renderToLink} />
    );
  }

  loadMore() {
    this.quantity += 10;
    this.setState({ isLoadMore: true }, this.getDataNews());
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
    return (
      <ScrollView onTouchStart={() => {
        if (this.state.listData.length <= 7) {
          // dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
        } else {
          dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(false);
        }
      }}
        onMomentumScrollEnd={() => dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true)}
        onScrollEndDrag={() => dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true)}
        showsHorizontalScrollIndicator={true} style={{}}>
        <View style={{ marginBottom: 72 }}>
          {
            this.state.isLoading ? <ProgressBar />
              : <View>
                {this.state.listData.length > 0
                  ? this.state.listData.map((e, i) => {
                    return (
                      this.renderRow(e)
                    );
                  })
                  : <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{I18n.t('noNewsData', { locale: this.props.setting.lang })}</Text>
                  </View>}
                {
                  this.state.isMore ? <TouchableOpacity onPress={this.loadMore.bind(this)}
                    style={[styles.rowExpandNews, { width: '100%' }]}>
                    <Text style={{ fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontBlue }}>{I18n.t('more', { locale: this.props.setting.lang })}</Text>
                  </TouchableOpacity>
                    : <View style={{ height: 72 }}></View>
                }
                <View style={{ height: 72 }}></View>
              </View>
          }
        </View>
      </ScrollView>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

export default connect(mapStateToProps)(SwipNews);
