import React, { PropTypes, Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  PixelRatio,
  Platform,
  Keyboard,
  InteractionManager
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import ProgressBar from '../../modules/_global/ProgressBar';
import HighLightText from '../../modules/_global/HighLightText';
import firebase from '../../firebase';
import {
  roundFloat,
  formatNumber,
  formatNumberNew2,
  formatNumberNew,
  logAndReport,
  checkPropsStateShouldUpdate,
  formatNumberNew2ClearZero,
  removeItemFromLocalStorage,
  offTouchIDSetting,
  largeValue,
  logDevice,
  pinComplete,
  checkTradingHalt,
  getDisplayName
} from '../../lib/base/functionUtil';
import ButtonBox from '../../modules/_global/ButtonBox';
import { func, dataStorage } from '../../storage';
import moment from 'moment';
import userType from '../../constants/user_type';
import { getDateStringWithFormat } from '../../lib/base/dateTime';
import timeagoInstance from '../../lib/base/time_ago';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Auth from '../../lib/base/auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import * as portfolioActions from '~s/portfolio/Redux/actions'
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import { VibrancyView, BlurView } from 'react-native-blur';
import Pin from '../../component/pin/pin'
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin'
import TouchAlert from '../setting/auth_setting/TouchAlert'
import { Navigation } from 'react-native-navigation'
import { getSymbolInfo } from '../../app.actions';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import * as util from '../../util';
import * as Controller from '../../memory/controller'
import { showNewOrderModal } from '~/navigation/controller.1'

const styles = {}
loginActions['getSymbolInfo'] = getSymbolInfo;
export class OrderTransaction extends Component {
  constructor(props) {
    super(props);
    this.userId = func.getUserId();
    this.state = {
      data: this.props.data || {}
      // volume: 0,
      // is_buy: false,
      // price: 0,
      // trade_date: new Date().getTime()
    };
    this.perf = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      this.setState({ data: nextProps.data });
    }
  }

  // componentWillMount() {
  //   try {
  //     this.perf = new Perf(performanceEnum.get_order_transaction_portfolio);
  //     this.perf && this.perf.start();
  //     const orderDetail = firebase.database().ref(`order_transaction/${dataStorage.accountId}/${this.props.symbol}/${this.props.data.order_id}/${this.props.data.transaction_id}`);
  //     orderDetail.on('value', function (params) {
  //       this.perf && this.perf.stop();
  //       const itemTemp = params.val();
  //       this.setState({
  //         volume: itemTemp ? itemTemp.volume : 0,
  //         is_buy: itemTemp ? itemTemp.is_buy : true,
  //         price: itemTemp ? formatNumberNew2(itemTemp.price, 3) : 0,
  //         trade_date: itemTemp ? itemTemp.trade_date : new Date().getTime()
  //       })
  //     }.bind(this));
  //   } catch (error) {
  //     logAndReport('componentWillMount openPrice OrderTransaction exception', error, 'componentWillMount OrderTransaction');
  //     logDevice('info', `componentWillMount openPrice OrderTransaction exception ${error}`);
  //   }
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const listProps = [{ data: ['order_id', 'transaction_id'] }];
  //   const listState = ['is_buy', 'price', 'volume', 'trade_date'];
  //   let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
  //   return check;
  // }

  render() {
    const { data } = this.state;
    if (data.volume === 0 && data.price === 0) {
      return (<View></View>)
    }
    return (
      <View style={[styles.rowExpand, this.props.style]}>
        <View style={{ paddingRight: 8, width: '50%', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name={data.is_buy === '1' ? 'ios-arrow-up' : 'ios-arrow-down'} style={{ color: data.is_buy === '1' ? '#00b800' : '#df0000', width: 24, height: 24, textAlign: 'center', top: 2, marginRight: 8 }} size={24} />
          <Text testID={`volumePrice-${this.props.testID}`} style={[CommonStyle.textSubNormalBlack]}>{`${formatNumber(data.volume)} @ ${formatNumberNew2(data.price, 3)}`}</Text>
        </View>
        <View style={{ paddingLeft: 8, width: '50%' }}>
          <Text testID={`tradeDate-${this.props.testID}`} numberOfLines={1} style={[CommonStyle.textSub, { textAlign: 'right', width: '100%' }]}>{getDateStringWithFormat(data.updated, 'DD MMM YYYY HH:mm')}</Text>
        </View>
      </View>
    );
  }
}

class OpenPrice extends Component {
  constructor(props) {
    super(props);
    this.changedIndex = this.changedIndex.bind(this);
    this.listDisplayExchange = [];
    this.authFunction = this.authFunction.bind(this);
    this.showOpenPosition = this.showOpenPosition.bind(this);
    this.type = '';
    this.upnl = 0;
    this.code = this.props.symbol || '';
    this.state = {
      listPosition: this.props.listPosition || {},
      tradingHalt: false,
      displayName: '',
      disabled: false,
      isGetted: false,
      code: '',
      listOrder: [],
      isExpand: false,
      isLoadContent: true,
      company: '',
      avg_price: '',
      upnl: null,
      market_price: '',
      fees: '',
      volume: '',
      value: '',
      isError: '',
      promptVisible: false,
      animationLogin: '',
      isAuthen: true,
      errorAuthen: '',
      isPinCodeModalVisible: false,
      isForgotPinModalVisible: false,
      animationAuthenByPin: '',
      isAndroidTouchIdModalVisible: false,
      params: []
    }
    this.listSymbol = {};
    this.topOt = null;
    this.showFormLogin = this.showFormLogin.bind(this);
    this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
    this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
    this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
    this.showFormLoginSuccessCallback = null;
    this.params = [];
    this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
    this.onForgotPin = this.onForgotPin.bind(this);
    this.getData = this.getData.bind(this);
    this.getDataHistory = this.getDataHistory.bind(this);
    this._onPinCompleted = this._onPinCompleted.bind(this);
    this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
    this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(this)
    this.props.registerChange(this.props.symbol, this.changedIndex, this.getDataHistory);
    this.getDataPosition = this.getDataPosition.bind(this);
    this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
  }

  getDataPosition() {
    let url = api.getUrlPositionByAccountId(dataStorage.accountId, this.props.symbol);
    api.requestData(url).then(data => {
      const val = Array.isArray(data) ? data[0] : data;
      let trend = 0;
      switch (val.trend) {
        case 'None': trend = 0; break;
        case 'Up': trend = 1; break;
        case 'Down': trend = -1; break;
        default: trend = 0;
      }

      let displayName = getDisplayName(this.props.symbol)
      this.setState({
        displayName,
        code: this.props.symbol,
        avg_price: val.average_price,
        upnl: val.upnl ? val.upnl : this.state.upnl,
        market_price: val.market_price,
        fees: val.fees,
        volume: val.volume,
        value: val.value,
        company: val.company,
        trend: trend,
        isGetted: true
      }, () => {
        this.perf && this.perf.stop();
      });
    });
  }

  showFormLogin(successCallback, params) {
    if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
      offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
    }
    if (successCallback) this.showFormLoginSuccessCallback = successCallback
    this.params = params || []
    this.authenPin && this.authenPin.showModalAuthenPin();
  }

  authFunction() {
    if (dataStorage.pinSetting !== 0) {
      this.showOpenPosition()
    } else {
      let objAndroidTouchIDFn = null;
      if (Platform.OS === 'android') {
        objAndroidTouchIDFn = {
          showAndroidTouchID: this.showAndroidTouchID,
          hideAndroidTouchID: this.hideAndroidTouchID,
          androidTouchIDFail: this.androidTouchIDFail
        }
      }
      this.auth.authentication(this.showOpenPosition, null, objAndroidTouchIDFn);
    }
  }

  changedIndex(isOpen) {
    this.setState({
      isExpand: isOpen
    });
  }

  componentWillUnmount() {
    logDevice('info', `OpenPrice unmount`);
    const upnl = this.state.upnl ? this.state.upnl : 0
    if (this.props && this.props.totalFooter) {
      this.props.totalFooter(0 - upnl);
    }
  }

  setDataSymbol(symbol = {}) {
    logDevice('info', `OpenPrice setDataSymbol func with data: ${symbol}`);
    this.listSymbol = symbol;
  }

  updateData() {
    fbemit.addListener('portfolio', `${this.props.symbol}`, data => {
      this.getDataCallback(data, true);
    })
  }

  componentDidMount() {
    this.updateData();
    !this.props.listPosition && this.getDataPosition();
    const dataStorageDisplayName = getDisplayName(this.props.symbol);
    if (this.props.displayName || dataStorageDisplayName) {
      const displayName = this.props.displayName || dataStorageDisplayName
      this.setState({ displayName });
    } else {
      let urlSymbolInfo = api.getSymbolUrl(false, true);
      const newTxt = util.encodeSymbol(this.props.symbol);
      api.requestData(`${urlSymbolInfo}${newTxt}`).then(data => {
        let val = Array.isArray(data) ? data[0] : data;
        this.setState({ displayName: val.display_name || '' });
      });
    }
    let symbolInfo = dataStorage.symbolEquity[this.code] || null;
    if (!symbolInfo) {
      this.props.loginActions.getSymbolInfo(this.code, this.setDataSymbol.bind(this))
    } else {
      this.listSymbol = symbolInfo;
    }
    Controller.getLoginStatus() && this.getData();
    if (this.props.isOpen && Controller.getLoginStatus()) {
      this.loadData(0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listPosition) {
      this.setState({ listPosition: nextProps.listPosition }, () => {
        this.getDataCallback(this.state.listPosition)
      });
    }
  }

  getDataCallback(data, isRealTime = false) {
    const val = data.length ? data[0] : data;
    if (isRealTime) {
      // const portfolio = store.portfolio;
      // const newUpnl = val.upnl || 0;
      // const oldUpnl = this.state.upnl || 0;
      // const oldTotalUpnl = portfolio.totalUpnl
      // this.props.portfolioActions.calculateUpnl(oldTotalUpnl, oldUpnl, newUpnl)
    }
    let trend = 0;
    switch (val.trend) {
      case 'None': trend = 0; break;
      case 'Up': trend = 1; break;
      case 'Down': trend = -1; break;
      default: trend = 0;
    }
    this.setState({
      code: this.props.symbol,
      avg_price: val.average_price,
      upnl: val.upnl ? val.upnl : this.state.upnl,
      market_price: val.market_price,
      fees: val.fees,
      volume: val.volume,
      value: val.value,
      company: val.company,
      trend: trend,
      isGetted: true
    }, () => {
      this.perf && this.perf.stop();
    });
  }

  getData() {
    try {
      Object.keys(this.state.listPosition).length > 0 && this.getDataCallback(this.state.listPosition);
    } catch (error) {
      logDevice('info', `OpenPrice getData exception: ${error}`)
    }
  }

  getDataHistory() {
    try {
      logDevice('info', `OpenPrice getDataHistory func`);
      this.perf = new Perf(performanceEnum.get_data_history);
      this.perf && this.perf.start();
      const urlOrderTransaction = api.getUrlTopOrderTransaction(dataStorage.accountId, this.code);
      return api.requestData(urlOrderTransaction, true).then(val => {
        logDevice('info', `OpenPrice getDataHistory result: ${val}`);
        let listOrder = val || [];
        listOrder.sort(function (a, b) {
          return b.updated - a.updated;
        });
        this.perf && this.perf.stop();
        if (this.props.isUniversalSearch) {
          listOrder = listOrder.slice(0, 5);
        }
        this.setState({
          listOrder,
          isLoadContent: false
        });
      });
    } catch (error) {
      this.setState({
        listOrder: [],
        isLoadContent: false
      });
      logAndReport('componentDidMount openPrice exception', error, 'componentDidMount openPrice');
      logDevice('info', `componentDidMount openPrice exception: ${error}`)
    }
  }

  showOpenPosition() {
    try {
      logDevice('info', `OpenPrice showOpenPosition func with type: ${this.type}`)
      let type = '';
      const originalType = this.type;
      if (!Controller.getLoginStatus()) return;
      if (this.type === 'adjust') {
        type = 'buy'
      } else {
        if (parseFloat(this.state.volume) < 0) {
          type = 'buy';
        } else {
          type = 'sell';
        }
      }
      const symbolInfo = this.listSymbol;
      logDevice('info', `OpenPrice showOpenPosition go to New Order width symbolinfo: ${JSON.stringify(symbolInfo)}`)
      const listExchange = symbolInfo ? symbolInfo.exchanges : [];
      const displayExchange = symbolInfo.display_exchange || 'ASX';
      const isParitech = (displayExchange + '').includes('ASX');
      this.setState({ disabled: false })
      const passProps = {
        displayName: this.state.displayName,
        type,
        isParitech,
        tradePrice: 1,
        code: this.props.symbol,
        exchanges: listExchange,
        volume: originalType === 'close'
          ? Math.abs(this.state.volume)
          : 0,
        isNotShowMenu: true
      }
      showNewOrderModal({
        navigator: this.props.navigator,
        passProps
      })
    } catch (error) {
      logAndReport('showOpenPosition openPrice exception', error, 'showOpenPosition openPrice');
      logDevice('info', `showOpenPosition openPrice exception ${error}`);
    }
  }

  renderHeader() {
    let flagIcon = Business.getFlag(this.props.symbol);
    let pdisplayName = this.state.displayName
    return (
      <View testID={`listUserPosition-${this.props.symbol}`} style={styles.headerBorder}>
        <View style={styles.headerContainer}>
          <Text style={[CommonStyle.textMainRed, { flex: this.state.tradingHalt ? 0.6 : 0 }]}>{this.state.tradingHalt ? '!' : ''}</Text>
          <Text testID={`openPriceCode-${this.props.symbol}`} style={[{ width: '25%' }, CommonStyle.textMain2]}>{pdisplayName.length > 8 ? Business.convertDisplayName(pdisplayName) : `${pdisplayName}`}</Text>
          <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
            <Flag
              type={'flat'}
              code={flagIcon}
              size={18}
            />
          </View>
          <HighLightText
            testID={`positionVolume-${this.props.symbol}`}
            style={[styles.col2, CommonStyle.textMainNoColor, { textAlign: 'right' }]}
            base={formatNumberNew2ClearZero(this.state.volume)}
            value={this.props.isPosition ? this.state.isGetted ? formatNumberNew2ClearZero(this.state.volume) : '--' : 0} />
          <Text style={[styles.col3, CommonStyle.textMain2, { textAlign: 'right' }]}
            testID={`positionMarketPrice-${this.props.symbol}`}>
            {this.props.isLoading ? '--' : (this.props.isPosition ? this.state.isGetted && this.state.market_price ? formatNumberNew2(this.state.market_price, 3) : '--' : '')}</Text>
          <Text testID={`positionValue-${this.props.symbol}`} style={[styles.col4, CommonStyle.textMain2, { textAlign: 'right' }]}>{this.props.isLoading ? '--' : this.state.isGetted && this.state.value ? formatNumberNew2(this.state.value, 2) : (this.props.isPosition ? '--' : '')}</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text style={[styles.col1, CommonStyle.textSub]}></Text>
          <Text testID={`positionFees-${this.props.symbol}`} style={[styles.col2, CommonStyle.textSub, { textAlign: 'right' }]} numberOfLines={1}>{this.state.fees !== undefined ? (this.props.isPosition ? this.state.isGetted ? formatNumberNew2(this.state.fees, 2) : '--' : '') : '--'}</Text>
          <Text testID={`positionAvgPrice-${this.props.symbol}`} style={[styles.col3, CommonStyle.textSub, { textAlign: 'right' }]}>{this.props.isPosition ? this.state.isGetted ? formatNumberNew2(this.state.avg_price, 3) : '--' : ''}</Text>
          <HighLightText
            testID={`positionUpnl-${this.props.symbol}`}
            style={[styles.col4, CommonStyle.textSubNoColor, { textAlign: 'right' }]}
            base={formatNumberNew2(this.state.upnl, 2)}
            value={this.props.isLoading ? null : (this.props.isPosition && this.state.upnl) ? formatNumberNew(this.state.upnl, 2) : ((this.props.isPosition && this.state.avg_price === null) || (this.props.isPosition && this.state.market_price === null)) ? '--' : ''} />
        </View>
      </View>
    )
  }

  loadData(changed) {
    logDevice('info', `OpenPrice loadData with value: ${changed}`);
    if (changed === 0) {
      this.props.changeIndex(this.props.symbol, true);
      InteractionManager.runAfterInteractions(() => {
        this.getDataHistory();
      })
    } else {
      this.props.changeIndex(this.props.symbol, false)
    }
  }

  renderContent(rowData) {
    const load = (
      <View style={{
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ProgressBar />
      </View>);

    if (this.props.isPosition) {
      return (
        <View style={styles.expandContainer}>
          <View style={styles.rowExpand2}>
            <View testID={`portfolioButtonAdjust-${this.props.symbol}`} style={[styles.colExpand1, { paddingRight: 10 }]}>
              <TouchableOpacity
                disabled={(this.state.disabled || !this.props.isConnected)}
                onPress={() => {
                  this.type = 'adjust';
                  this.authFunction()
                }}
                style={[styles.buttonExpand, { backgroundColor: (this.state.disabled || !this.props.isConnected) ? '#0000001e' : config.colorVersion }]}>
                <Text style={[CommonStyle.textButtonColor, { color: !this.props.isConnected ? 'black' : 'white' }]}>{I18n.t('neworderUpper', { locale: this.props.setting.lang })}</Text>
              </TouchableOpacity>
            </View>
            <View testID={`portfolioButtonClose-${this.props.symbol}`} style={[styles.colExpand1, { paddingLeft: 10 }]}>
              <TouchableOpacity
                disabled={(this.state.disabled || !this.props.isConnected)}
                onPress={() => {
                  this.type = 'close';
                  this.authFunction()
                }}
                style={[styles.buttonExpand, { backgroundColor: !this.props.isConnected ? '#0000001e' : '#ff1643' }]}>
                <Text style={[CommonStyle.textButtonColor, { color: !this.props.isConnected ? 'black' : 'white' }]}>{I18n.t('closeUpper', { locale: this.props.setting.lang })}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: '100%' }}>
            {
              this.state.isLoadContent ? load : this.state.listOrder.map((e, i) =>
                <OrderTransaction code={this.props.symbol}
                  data={e} key={e.id}
                  testID={e.id}
                  style={{ borderColor: '#0000001e', borderTopWidth: i === 0 ? 0 : 1 }} />
              )
            }
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const listProps = [{ portfolio: ['isLoading', 'loading', 'listData'] }, { login: ['isLogin'] }, { app: ['isConnected'] }];
  //   const listState = ['warningText'];
  //   let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
  //   return check;
  // }
  // Android
  showAndroidTouchID(params) {
    dataStorage.onAuthenticating = true
    dataStorage.dismissAuthen = this.hideAndroidTouchID
    this.setState({
      isAndroidTouchIdModalVisible: true,
      params
    })
  }
  hideAndroidTouchID() {
    dataStorage.onAuthenticating = false
    this.setState({
      isAndroidTouchIdModalVisible: false
    })
  }
  androidTouchIDFail(callback, numberFingerFailAndroid) {
    this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
  }

  authenPinFail() {
    this.authenPin && this.authenPin.authenFail()
  }

  _onPinCompleted(pincode) {
    const store = Controller.getGlobalState()
    const login = store.login;
    const refreshToken = login.loginObj.refreshToken
    pinComplete(pincode, this.authenPin, this.showFormLoginSuccessCallback, this.authenPinFail.bind(this), this.params, refreshToken)
  }
  onChangeAuthenByFingerPrint() {
    this.authenPin && this.authenPin.hideModalAuthenPin();
    let objAndroidTouchIDFn = null;
    if (Platform.OS === 'android') {
      objAndroidTouchIDFn = {
        showAndroidTouchID: this.showAndroidTouchID,
        hideAndroidTouchID: this.hideAndroidTouchID,
        androidTouchIDFail: this.androidTouchIDFail
      }
    }
    this.auth.authentication(this.showOpenPosition, null, objAndroidTouchIDFn);
  }
  onForgotPin() {
    Keyboard.dismiss();
    this.authenPin && this.authenPin.hideModalAuthenPin();
    setTimeout(() => {
      this.setState({
        isForgotPinModalVisible: true
      })
    }, 500)
  }
  removeItemStorageSuccessCallback() {
    dataStorage.numberFailEnterPin = 0;
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        this.props.navigator.showModal({
          screen: 'equix.SetPin',
          animated: true,
          animationType: 'slide-up',
          navigatorStyle: {
            statusBarColor: config.background.statusBar,
            statusBarTextColorScheme: 'light',
            navBarHidden: true,
            navBarHideOnScroll: false,
            navBarTextFontSize: 16,
            drawUnderNavBar: true,
            navBarNoBorder: true,
            screenBackgroundColor: 'transparent',
            modalPresentationStyle: 'overCurrentContext'
          },
          passProps: {
            type: 'new'
          }
        })
      } else {
        this.props.navigator.showModal({
          screen: 'equix.SetPin',
          animated: true,
          animationType: 'slide-up',
          navigatorStyle: {
            statusBarColor: config.background.statusBar,
            statusBarTextColorScheme: 'light',
            navBarHidden: true,
            navBarHideOnScroll: false,
            navBarTextFontSize: 16,
            drawUnderNavBar: true,
            navBarNoBorder: true,
            screenBackgroundColor: 'transparent',
            modalPresentationStyle: 'overCurrentContext'
          },
          passProps: {
            type: 'new'
          }
        })
      }
    }, 500)
  }
  removeItemStorageErrorCallback() {
  }
  forgotPinSuccessCb() {
    console.log('forgot pin success');
    removeItemFromLocalStorage(dataStorage.userPin.email, this.removeItemStorageSuccessCallback, this.removeItemStorageErrorCallback)
  }
  onBackDropModalPress() {
    Keyboard.dismiss()
    this.setState({
      isPinCodeModalVisible: false
    })
  }
  render() {
    return (
      <View>
        <Accordion
          sections={[this.props.data]}
          onChange={this.loadData.bind(this)}
          activeSection={this.state.isExpand ? 0 : false}
          renderHeader={this.renderHeader.bind(this)}
          renderContent={this.renderContent.bind(this)}>
        </Accordion>
        {
          this.auth.showLoginForm(this.state.isForgotPinModalVisible, 'Reset Your PIN', 'Please enter your password', this.state.animationLogin, () => {
            this.setState({
              animationLogin: ''
            });
          }, () => {
            this.setState({
              isForgotPinModalVisible: false
            });
          }, () => {
            this.props.loginActions.authError();
            this.setState({
              // animationLogin: 'shake',
              isError: true
            });
          }, () => {
            this.props.loginActions.authSuccess();
            this.setState({
              isForgotPinModalVisible: false,
              isError: false
            });
          }, () => {
            this.props.loginActions.authSuccess();
            this.setState({
              isForgotPinModalVisible: false,
              isError: false
            }, () => {
              this.forgotPinSuccessCb()
            });
          }, null, null, this.state.isError, true)
        }
        <AuthenByPin
          onForgotPin={this.onForgotPin}
          onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
          onRef={ref => this.authenPin = ref}
          onPinCompleted={this._onPinCompleted}
        />
        <TouchAlert
          ref={ref => this.androidTouchID = ref}
          visible={this.state.isAndroidTouchIdModalVisible}
          dismissDialog={this.hideAndroidTouchID}
          authenByPinFn={this.showFormLogin.bind(this, this.showOpenPosition, this.state.params)}
        />
      </View>

    )
  }
}

export function mapStateToProps(state, ownProps) {
  return {
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loginActions: bindActionCreators(loginActions, dispatch),
    authSettingActions: bindActionCreators(authSettingActions, dispatch),
    portfolioActions: bindActionCreators(portfolioActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenPrice);
