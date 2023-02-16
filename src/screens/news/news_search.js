import React, { Component } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard, Dimensions, Animated, TouchableWithoutFeedback, PixelRatio, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style/news_search';
import { func, dataStorage } from '../../storage';
import { iconsMap } from '../../utils/AppIcons';
import ProgressBar from '../../modules/_global/ProgressBar';
import timeagoInstance from '../../lib/base/time_ago';
import * as newsActions from './news.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logAndReport, searchResponse, logDevice, showNewsDetail, pushToVerifyMailScreen, isIphoneXorAbove } from '../../lib/base/functionUtil';
import config from '../../config';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import RetryConnect from '../../component/retry_connect/retry_connect';
import RowNews from './row_news';
import deviceModel from '../../constants/device_model';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import XComponent from '../../component/xComponent/xComponent'
import Enum from '../../enum'
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import * as Controller from '../../../src/memory/controller'
import SearchBarTextInput from '~/component/search_bar/search_bar_text_input'
const { height, width } = Dimensions.get('window');

export class NewsSearch extends XComponent {
  constructor(props) {
    super(props);

    //  bind function
    this.init = this.init.bind(this)
    this.bindAllFunc = this.bindAllFunc.bind(this)
    this.bindAllFunc();

    //  init state and dic
    this.init();
  }

  init() {
    this.dic = {
      keyboardDidShowListener: null,
      keyboardDidHideListener: null,
      deviceModel: dataStorage.deviceModel,
      textSearch: '',
      timeoutBlur: null,
      countPage: 15,
      currentNew: null
    }
    this.state = {
      isLoading: false,
      textSearchReal: '',
      textSearch: this.props.code ? this.props.code : '',
      typeNews: this.props.typeNews || 'All',
      keyboardHeight: 0
    }
  }

  bindAllFunc() {
    this.keyboardDidShow = this.keyboardDidShow.bind(this);
    this.keyboardDidHide = this.keyboardDidHide.bind(this);
    this.renderToLink = this.renderToLink.bind(this);
    this.searchNewsResponse = this.searchNewsResponse.bind(this);
    this.perf = new Perf(performanceEnum.show_form_news_search);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.onFocus = this.onFocus.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
    this.keyExtractor = this.onKeyExtractor.bind(this)
    this.renderRow = this.renderRow.bind(this)
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        default: break;
      }
    } else {
      switch (event.id) {
        case 'willAppear':
          setCurrentScreen(analyticsEnum.newsSearch);
          this.perf && this.perf.incrementCounter(performanceEnum.show_form_news_search);
          this.dic.currentNew = null;
          break;
        case 'didAppear':
          break;
        case 'willDisappear':
          break;
        case 'didDisappear':
          break;
        default:
          break;
      }
    }
  }

  componentDidMount() {
    super.componentDidMount()
    let textSearch = this.props.code;
    this.onChangeText(textSearch);
    this.dic.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.dic.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.news && nextProps.news.isSearchLoading !== this.state.isLoading) {
      this.setState({ isLoading: nextProps.news.isSearchLoading });
    }
    if (nextProps && (nextProps.typeNews !== this.state.typeNews)) {
      this.setState({ typeNews: nextProps.typeNews });
    }
  }

  componentWillUnmount() {
    this.dic.keyboardDidShowListener.remove();
    this.dic.keyboardDidHideListener.remove();
    super.componentWillUnmount()
  }

  keyboardDidShow(e) {
    keyboardHeight = e.endCoordinates.height || 0;
    this.setState({ isShowKeyboard: true, keyboardHeight })
  }

  keyboardDidHide() {
    const keyboardHeight = 0;
    this.setState({ isShowKeyboard: false, keyboardHeight })
  }

  renderTag(item, i) {
    try {
      const getTagDefaultStyle = (i) => {
        return {
          backgroundColor: item === 'halt' ? '#FBD937' : item === 'lifted' ? '#43C3D4' : '#F28BB0',
          height: 16,
          width: item === 'halt' ? 40 : item === 'lifted' ? 70 : 100,
          marginLeft: i > 0 ? 16 : 0
        }
      }
      const getTagNStyle = (i) => {
        return {
          backgroundColor: '#43C3D4',
          height: 16,
          width: 40,
          marginLeft: i > 0 ? 16 : 0
        }
      }
      const getTagMStyle = (i) => {
        return {
          backgroundColor: '#FBD937',
          height: 16,
          width: 72,
          marginLeft: i > 0 ? 16 : 0
        }
      }
      if (item === '$') {
        return (
          <View style={getTagMStyle()} key={i}>
            <Text style={CommonStyle.tagLabel}>{I18n.t('priceSensitive', { locale: this.props.setting.lang })}</Text>
          </View>
        );
      }
      if (item === 'N') {
        return (
          <View style={getTagNStyle()} key={i}>
            <Text style={CommonStyle.tagLabel}>{I18n.t('News', { locale: this.props.setting.lang })}</Text>
          </View>
        );
      }

      return (
        <View style={getTagDefaultStyle(i)} key={i}>
          <Text style={CommonStyle.tagLabel}>{item === 'halt' ? I18n.t('half', { locale: this.props.setting.lang }) : item === 'lifted' ? I18n.t('halfLifted', { locale: this.props.setting.lang }) : I18n.t('announcement', { locale: this.props.setting.lang })}</Text>
        </View>
      );
    } catch (error) {
      logAndReport('renderTag news exception', error, 'renderTag news');
      logDevice('info', `renderTag news exception ${error}`);
    }
  }

  renderToLink(data) {
    const newID = data.news_id || ''
    showNewsDetail(newID, this.props.navigator, this.props.isConnected)
  }

  renderRow({ item, index }) {
    try {
      if (!item.type_news && !item.code && !item.title && !item.page_count) return null;
      let check = false;
      if (Controller.getLoginStatus()) {
        const listUnread = dataStorage.list_news_unread || {};
        const check = listUnread[item.news_id];
      }
      return (
        <RowNews newType={this.props.type} index={index} unread={!!check} data={item} renderToLink={this.renderToLink} />
      );
    } catch (error) {
      logAndReport('renderRow newsSearch  exception', error, 'renderRow newsSearch');
      logDevice('info', `renderRow newsSearch  exception ${error}`);
    }
  }

  dismissModal() {
    Keyboard.dismiss()
    this.props.navigator.dismissModal();
  }

  searchNewsResponse(textSearch) {
    try {
      if (textSearch) {
        const filterNewType = this.props.typeNews
        this.props.actions.searchNews(filterNewType, textSearch);
      } else {
        this.props.actions.newsSearchResponse([], this.dic.textSearch);
      }
    } catch (error) {
      logDevice('info', `News search response exception: ${error}`);
    }
  }

  onChangeText(text) {
    this.setState({ textSearch: text });
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.dic.timeoutBlur) {
      clearTimeout(this.dic.timeoutBlur);
    }
    this.timeout = setTimeout(() => {
      if (text.length > 0) {
        let textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
        const tmp = textSearch.split('.');
        if (tmp[0] && !tmp[1]) {
          textSearch = tmp[0];
        }
        this.dic.textSearch = textSearch;
        this.setState({ isLoading: true, textSearchReal: textSearch })
        this.props.actions.searchRequest();
        if (this.props.isRelated) {
          const dicRelated = dataStorage.dicRelatedSymbol;
          const textSearchUpperCase = (textSearch + '').toUpperCase()

          if (dicRelated.indexOf(textSearchUpperCase) > -1) {
            this.searchNewsResponse(textSearch);
          } else {
            this.searchNewsResponse('');
          }
        } else {
          this.searchNewsResponse(textSearch);
        }
      } else {
        this.dic.textSearch = '';
        this.setState({ textSearchReal: '' })
        this.searchNewsResponse('');
      }
    }, 300);
  }

  onFocus() {
    this.dic.textSearch = '';
    this.setState({ textSearch: '' })
    this.searchNewsResponse('');
    // this.props.actions.loadForm('', this.dic.countPage, this.state.typeNews);
  }

  onKeyExtractor(item) {
    return item.news_id;
  }

  render() {
    let loading = null;
    if (this.props.isConnected) {
      loading = (
        <View style={{
          backgroundColor: CommonStyle.backgroundColor,
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ProgressBar testID='newsLoading' />
          {Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }}></View> : null}
        </View>
      );
    } else {
      loading = (
        <RetryConnect onPress={() => this.searchNewsResponse(this.dic.textSearch)} />
      );
    }
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: CommonStyle.statusBarBgColor, paddingTop: dataStorage.platform === 'ios' ? (isIphoneXorAbove() ? 36 : 16) : 0 }}>
          {/* <View style={CommonStyle.searchBarContainerClone}>
            <View style={[styles.searchBar2, { backgroundColor: CommonStyle.searchInputBgColor }]}>
              <Icon testID='NewsSearchIcon' name='ios-search' style={[styles.iconSearch2]} />
              <TextInput
                selectionColor={CommonStyle.fontColor}
                testID='NewsSearchInput'
                style={[styles.inputStyle, { lineHeight: Platform.OS === 'ios' ? 0 : 14, color: CommonStyle.fontColor }]}
                underlineColorAndroid='transparent'
                autoFocus={true}

                returnKeyType="search"
                placeholder={I18n.t('search')}
                placeholderTextColor={CommonStyle.searchPlaceHolder}
                onChangeText={(text) => this.onChangeText(text)}
                value={this.state.textSearch}
              />
              <TouchableOpacity
                activeOpacity={1}
                // style={{
                //   width: 18,
                //   height: 18,
                //   justifyContent: 'center',
                //   alignItems: 'center',
                //   backgroundColor: '#ececec',
                //   borderRadius: 9
                // }}
                onPress={this.onFocus.bind(this)}
              >
                <Icon
                  testID="NewsSearchClearIcon"
                  name="ios-close-circle"
                  style={CommonStyle.iconCloseLight}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              testID='NewsSearchCancelButton'
              style={styles.buttonCancelClone}
              onPress={this.dismissModal}>
              <Text style={CommonStyle.whiteText}>{I18n.t('cancel', { locale: this.props.setting.lang })}</Text>
            </TouchableOpacity>
          </View> */}
          <SearchBarTextInput
            onChangeText={(text) => this.onChangeText(text)}
            onReset={this.onFocus.bind(this)}
            onDismissModal={this.dismissModal}
            textSearch={this.state.textSearch}
          />
          {Controller.getUserVerify() === 0 ? <VerifyMailNoti verifyMailFn={() => {
            pushToVerifyMailScreen(this.props.navigator, this.props.setting.lang)
          }}></VerifyMailNoti> : <View />}
          {
            this.state.isLoading
              ? loading
              : (this.props.news.listDataSearch && this.props.news.listDataSearch.length > 0
                ? <View style={{ backgroundColor: CommonStyle.backgroundColor, width: '100%', flex: 1 }}>
                  <FlatList
                    testID='NewsSearchScroll'
                    data={this.props.news.listDataSearch}
                    keyboardShouldPersistTaps='always'
                    keyExtractor={this.onKeyExtractor}
                    renderItem={this.renderRow}
                  />
                  {Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }}></View> : null}
                </View>
                : (this.state.textSearchReal.length >= 2 && !this.state.isLoading ? <View style={{ flex: 1, width: '100%', backgroundColor: CommonStyle.backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
                  <Text
                    style={{ color: CommonStyle.fontColor }}
                    testID='NewsSearchNoData'>
                    {I18n.t('noNewsData', { locale: this.props.setting.lang })}
                  </Text>
                  {Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }}></View> : null}
                </View> : <View style={{ flex: 1, width: '100%', backgroundColor: CommonStyle.backgroundColor }}></View>))
          }
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    news: state.news,
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(newsActions, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(NewsSearch);
