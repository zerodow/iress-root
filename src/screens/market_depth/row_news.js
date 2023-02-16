import React, { Component } from 'react';
import {
  formatNumber, getPriceSource, logAndReport, logDevice, showNewsDetail
} from '../../lib/base/functionUtil';
import { View, Text, PixelRatio, TouchableOpacity } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import firebase from '../../firebase';
import timeagoInstance from '../../lib/base/time_ago';
import RowNews2 from '../news/row_news';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getNewsUrl, requestData } from '../../api';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import I18n from '../../modules/language';
import Enum from '../../enum';

export class RowNews extends Component {
  constructor(props) {
    super(props);
        this.id = this.props.id || '';
    this.renderToLink = this.renderToLink.bind(this);
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.getDataNews();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.id !== this.id) {
      this.id = nextProps.id;
      this.getDataNews()
    }
  }

  getDataNews() {
    this.perf = new Perf(performanceEnum.get_data_news);
    this.perf && this.perf.start();
    let url = getNewsUrl(this.id);
    requestData(url).then(res => {
      if (res && res[0]) {
        this.setState({ data: res[0] }, () => {
          this.perf.stop();
        })
      }
    }).catch(error => {
      logDevice('info', `Row News load data exception: ${error}`);
      // console.log('cannot get news data with news id: ', this.id);
    })
  }

  renderTag(item, i, obj) {
    try {
      const getTagDefaultStyle = (i) => {
        return {
          borderRadius: CommonStyle.borderRadius,
          backgroundColor: item === 'halt' ? '#FBD937' : item === 'lifted' ? '#43C3D4' : '#F28BB0',
          height: 16,
          width: item === 'halt' ? 40 : item === 'lifted' ? 70 : 100,
          marginLeft: i > 0 ? 16 : 0,
          overflow: 'hidden'
        }
      }
      const getTagNStyle = (i) => {
        return {
          borderRadius: CommonStyle.borderRadius,
          backgroundColor: '#43C3D4',
          height: 16,
          width: 40,
          marginLeft: i > 0 ? 16 : 0,
          overflow: 'hidden'
        }
      }
      const getTagMStyle = (i) => {
        return {
          borderRadius: CommonStyle.borderRadius,
          backgroundColor: '#FBD937',
          height: 16,
          width: 72,
          marginLeft: i > 0 ? 16 : 0,
          overflow: 'hidden'
        }
      }
      if (item === '$') {
        return (
          <View style={getTagMStyle(i)} key={i}>
            <Text testID={`${obj.id}tag$Text`} style={CommonStyle.tagLabel}>{I18n.t('priceSensitive', { locale: this.props.setting.lang })}</Text>
          </View>
        );
      }
      if (item === 'N') {
        return (
          <View testID={`${obj.id}tagN`} style={getTagNStyle(i)} key={i}>
            <Text testID={`${obj.id}tagNText`} style={CommonStyle.tagLabel}>{I18n.t('News', { locale: this.props.setting.lang })}</Text>
          </View>
        );
      }

      return (
        <View testID={item === 'A' ? `${obj.id}tagA` : `${obj.id}tagH`} style={getTagDefaultStyle(i)} key={i}>
          <Text testID={item === 'A' ? `${obj.id}tagAText` : `${obj.id}tagHText`} style={CommonStyle.tagLabel}>{item === 'halt' ? 'Halt' : item === 'lifted' ? 'Halt Lifted' : 'Announcement'}</Text>
        </View>
      );
    } catch (error) {
      console.log('renderTag news logAndReport exception: ', error)
      logAndReport('renderTag news exception', error, 'renderTag news');
    }
  }

  renderToLink(data) {
    const newID = data.news_id || ''
    showNewsDetail(newID, this.props.navigator, this.props.isConnected)
  }

  renderRow() {
    const item = this.state.data;
    return (
      <RowNews2 data={item} renderToLink={this.renderToLink} />
    );
  }

  render() {
    return (
      <View style={{ width: '100%' }}>
        {this.renderRow()}
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

export default connect(mapStateToProps)(RowNews);
