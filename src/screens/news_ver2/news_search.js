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
import SearchResult from '~s/order/order_search';
import ScrollBarUndeline from '../../component/scrollbar_underline/scrollbar_underline'
const { height, width } = Dimensions.get('window');
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = Enum
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
      keyboardHeight: 0,
      listSymbolClass: [
        {
          id: SYMBOL_CLASS.ALL_TYPES,
          label: I18n.t(SYMBOL_CLASS.ALL_TYPES),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.EQUITY,
          label: I18n.t(SYMBOL_CLASS.EQUITY),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.ETFS,
          label: I18n.t(SYMBOL_CLASS.ETFS),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.MF,
          label: I18n.t(SYMBOL_CLASS.MF),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.WARRANT,
          label: I18n.t(SYMBOL_CLASS.WARRANT),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.FUTURE,
          label: I18n.t(SYMBOL_CLASS.FUTURE),
          action: this.onSelectSymbolClass
        },
        {
          id: SYMBOL_CLASS.OPTION,
          label: I18n.t(SYMBOL_CLASS.OPTION),
          action: this.onSelectSymbolClass
        }
      ]
    }
  }

  bindAllFunc() {
    this.keyboardDidShow = this.keyboardDidShow.bind(this);
    this.keyboardDidHide = this.keyboardDidHide.bind(this);
    this.searchNewsResponse = this.searchNewsResponse.bind(this);
    this.perf = new Perf(performanceEnum.show_form_news_search);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.onFocus = this.onFocus.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
    this.keyExtractor = this.onKeyExtractor.bind(this)
    this.onPressSearch = this.onPressSearch.bind(this);
    this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this)
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

  dismissModal(symbolObj) {
    Keyboard.dismiss();
    this.props.onClickSearch && this.props.onClickSearch(symbolObj);
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
  onSelectSymbolClass(selectedClass) {
    this.dic.selectedClass = selectedClass
    if (!this.dic.textSearch) {
      this.getSearchHistoryByClass()
    } else {
      this.loadData(this.dic.textSearch)
    }
  }
  getSearchHistoryByClass() {
    const dicSearchHistoryByClass = (this.dic.dicHistoryByClass && this.dic.dicHistoryByClass[this.dic.selectedClass]) || []
    this.setState({
      listData: dicSearchHistoryByClass,
      isLoading: false
    });
  }
  loadData(text) {
    if (text && text.length > 1) {
      const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
      const cb = this.callbackSearch
      const classQuery = this.getClassQuery()
      this.dic.textSearch = textSearch;
      searchResponse({ textSearch, cb, classQuery })
    } else {
      const dicSearchHistoryByClass = (this.dic.dicHistoryByClass && this.dic.dicHistoryByClass[this.dic.selectedClass]) || []
      this.setState({
        isHistory: true,
        index: 0,
        listData: dicSearchHistoryByClass,
        isLoading: false
      });
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
      this.searchSymbol && this.searchSymbol(text);
    }, 300);
  }

  onFocus() {
    this.dic.textSearch = '';
    this.setState({ textSearch: '' })
    this.searchNewsResponse('');
  }
  onPressSearch(symbolObj) {
    console.log('symbol obj search ', symbolObj);
    this.dismissModal(symbolObj);
  }
  onKeyExtractor(item) {
    return item.news_id;
  }
  renderResultSearch() {
    return <SearchResult
      register={fn => this.searchSymbol = fn}
      onPressSearch={this.onPressSearch}
    />
  }
  renderClass = () => {
    return (
      <ScrollBarUndeline listItem={this.state.listSymbolClass} />
    )
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
          <SearchBarTextInput
            onChangeText={(text) => this.onChangeText(text)}
            onReset={this.onFocus.bind(this)}
            onDismissModal={this.dismissModal}
            textSearch={this.state.textSearch}
          />
          {Controller.getUserVerify() === 0 ? <VerifyMailNoti verifyMailFn={() => {
            pushToVerifyMailScreen(this.props.navigator, this.props.setting.lang)
          }}></VerifyMailNoti> : <View />}
          {this.renderClass()}
          {
            this.renderResultSearch()
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
