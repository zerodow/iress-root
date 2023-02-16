import React, { Component } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Keyboard, PixelRatio,
  KeyboardAvoidingView,
  Platform, Dimensions, ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FirebaseManager from '../../lib/base/firebase_manager';
import styles from './style/addcode';
import { func, dataStorage } from '../../storage';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import AddCodeDetail from './addcode.detail';
import I18n from '../../modules/language';
import { logAndReport, searchAndSort, searchResponse, logDevice, getDisplayName, isIphoneXorAbove } from '../../lib/base/functionUtil';
import deviceModel from '../../constants/device_model';
import { requestData, getSymbolUrl, addUserWatchList } from '../../api';
import * as appActions from '../../app.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning'
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import ProgressBar from '../../modules/_global/ProgressBar';
import count from '../../constants/news_count';
export class SearchCode extends Component {
  constructor(props) {
    super(props);
    this.userId = func.getUserId();
    this.textSearch = '';
    this.originalList = this.props.originalList;
    this.deviceModel = dataStorage.deviceModel;
    this.state = {
      isLoading: false,
      index: 0,
      textSearch: '',
      listData: [],
      isShowKeyboard: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => {
          return r1 !== r2;
        }
      })
    }
    this.callbackSearch = this.callbackSearch.bind(this);
    this.updateListAddSymbol = this.updateListAddSymbol.bind(this)
    this.updateListRemoveSymbol = this.updateListRemoveSymbol.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.timeout = null;
    this.perf = new Perf(performanceEnum.show_form_add_code_search);
    this.listAdd = []
    this.listRemove = []
  }

  _renderRow(rowData, sectionID, rowID) {
    const symbol = rowData.symbol
    const displayName = getDisplayName(symbol);
    return (
      <AddCodeDetail
        dicUserSymbol={this.props.dicUserSymbol || {}}
        symbol={symbol}
        displayName={displayName || ''}
        updateListAddSymbol={this.updateListAddSymbol}
        updateListRemoveSymbol={this.updateListRemoveSymbol}
        data={rowData}
        key={rowData.symbol} />
    )
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        default: break;
      }
    } else {
      switch (event.id) {
        case 'willAppear':
          setCurrentScreen(analyticsEnum.addCodeSearch);
          this.perf.incrementCounter(performanceEnum.show_form_add_code_search);
          this.loadData('');
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

  callbackSearch(listSymbol) {
    const listData = listSymbol || [];
    if (!dataStorage.continueSearch) {
      this.setState({
        listData: listData,
        dataSource: this.state.dataSource.cloneWithRows(listData),
        isLoading: false
      }, () => {
        this.perf && this.perf.stop();
      });
    }
  }

  loadData(text) {
    if (text && text.length > 1) {
      dataStorage.continueSearch = true;
      this.perf = new Perf(performanceEnum.add_code_search);
      this.perf && this.perf.start();
      const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
      this.textSearch = textSearch;
      searchResponse(textSearch, this.callbackSearch)
    } else {
      this.setState({
        index: 0,
        listData: [],
        dataSource: this.state.dataSource.cloneWithRows([])
      })
    }
  }

  searchSymbol(text) {
    this.setState({ textSearch: text, isLoading: text !== '' });
    this.timeout && clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.loadData(text);
    }, 700)
  }

  updateListAddSymbol(code) {
    const index = this.listAdd.indexOf(code)
    const removeIndex = this.listRemove.indexOf(code)
    if (index < 0) {
      this.listAdd.unshift(code)
    }
    this.listRemove.splice(removeIndex, 1)
  }

  updateListRemoveSymbol(code) {
    const index = this.listRemove.indexOf(code)
    const removeIndex = this.listAdd.indexOf(code)
    if (index < 0) {
      this.listRemove.push(code)
    }
    this.listAdd.splice(removeIndex, 1)
  }

  closeModal() {
    const listAdd = this.listAdd;
    const listRemove = this.listRemove;
    const originalList = this.originalList || {};
    let arr = Object.keys(originalList);
    arr = [...listAdd, ...arr];
    arr = arr.filter((item, index) => {
      return listRemove.indexOf(item) < 0
    })
    let originalListAfterUpdate = {}
    for (let index = 0; index < arr.length; index++) {
      const symbol = arr[index];
      if (symbol) {
        originalListAfterUpdate[symbol] = {
          symbol,
          rank: index
        }
      }
    }
    this.originalList = { ...originalListAfterUpdate }
    this.props.callbackSetOriginalData(this.originalList)
    this.props.navigator.dismissModal({
      animated: true,
      animationType: 'slide-down'
    })
  }

  onFocus() {
    this.textSearch = '';
    this.setState({ textSearch: '' })
    this.loadData('');
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ isShowKeyboard: true })
  }

  _keyboardDidHide() {
    this.setState({ isShowKeyboard: false })
  }

  _renderFooter() {
    return (
      <View style={{ width: '100%', borderTopWidth: 1, borderColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      </View>
    )
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: CommonStyle.statusBarBgColor, paddingTop: dataStorage.platform === 'ios' ? (isIphoneXorAbove() ? 36 : 16) : 0 }}>
        <View style={CommonStyle.searchBarContainerClone}>
          <View style={styles.searchBar2}>
            <Icon name='ios-search' style={styles.iconSearch2} />
            <TextInput
              // selectionColor={'#FFFFFF'}
              testID='watchListSearchCodeInput'
              style={[styles.inputStyle, { lineHeight: Platform.OS === 'ios' ? 0 : 14 }]}
              underlineColorAndroid='transparent'
              placeholder={I18n.t('search', { locale: this.props.setting.lang })}
              placeholderTextColor='#FFFFFF'
              autoFocus={true}
              blurOnSubmit={true}
              onFocus={this.onFocus.bind(this)}
              onChangeText={(text) => this.searchSymbol(text)}
              value={this.state.textSearch}
            />
            <Icon testID='iconCancelSearchCode' name='ios-close-circle' style={[styles.iconRight2, CommonStyle.iconCloseLight]}
              onPress={this.onFocus.bind(this)} />
          </View>
          <TouchableOpacity
            style={styles.buttonCancelClone}
            onPress={this.closeModal.bind(this)}>
            <Text style={styles.whiteText}>{I18n.t('done', { locale: this.props.setting.lang })}</Text>
          </TouchableOpacity>
        </View>
        {
          !this.props.isConnected ? <NetworkWarning /> : null
        }
        {
          Platform.OS === 'ios'
            ? <KeyboardAvoidingView behavior='padding' style={{ backgroundColor: 'white', width: '100%', flex: 1 }}>
              {
                this.state.isLoading
                  ? <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                    <ProgressBar />
                  </View>
                  : this.state.listData && this.state.listData.length > 0
                    ? <ListView
                      onEndReachedThreshold={30}
                      renderScrollComponent={props => <InvertibleScrollView
                        testID={`${this.props.topType}ScrollViewWatchList`}
                        keyboardShouldPersistTaps={'always'}
                        {...props}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                      />}
                      removeClippedSubviews={false}
                      keyboardShouldPersistTaps="always"
                      enableEmptySections
                      automaticallyAdjustContentInsets={false}
                      dataSource={this.state.dataSource}
                      initialListSize={20}
                      pageSize={30}
                      renderRow={this._renderRow.bind(this)}
                      renderFooter={this._renderFooter.bind(this)}
                    />
                    : this.state.textSearch === '' ? null : <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                      <Text>{I18n.t('noData', { locale: this.props.setting.lang })}</Text>
                    </View>
              }

            </KeyboardAvoidingView>
            : <View style={{ backgroundColor: 'white', width: '100%', flex: 1, paddingLeft: 16, paddingRight: 16 }}>
              {
                this.state.isLoading
                  ? <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                    <ProgressBar />
                  </View>
                  : this.state.listData && this.state.listData.length > 0
                    ? <ListView
                      onEndReachedThreshold={30}
                      renderScrollComponent={props => <InvertibleScrollView
                        testID={`${this.props.topType}ScrollViewWatchList`}
                        keyboardShouldPersistTaps={'always'}
                        {...props}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                      />}
                      removeClippedSubviews={false}
                      keyboardShouldPersistTaps="always"
                      enableEmptySections
                      automaticallyAdjustContentInsets={false}
                      dataSource={this.state.dataSource}
                      initialListSize={20}
                      pageSize={30}
                      renderRow={this._renderRow.bind(this)}
                      renderFooter={this._renderFooter.bind(this)}
                    />
                    : this.state.textSearch === '' ? null : <View style={{ flex: 1, height: Dimensions.get('window').height, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                      <Text>{I18n.t('noData', { locale: this.props.setting.lang })}</Text>
                    </View>
              }
              {/* <View style={{ height: 40 }}>
              </View> */}
            </View>
        }
      </View>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    action: bindActionCreators(appActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCode);
