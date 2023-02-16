import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { setRefTabbar } from '~/lib/base/functionUtil';
import Modal from '~/component/Modal';
import HeaderBar from './Views/HeaderBar';
import HeaderFilter from './Views/HeaderFilter';
import Content from './Views/Content'
import { handleShowNewOrder } from '~/screens/new_order/Controller/SwitchController.js';
import NetworkWarning from '~/component/network_warning/network_warning_layout_animation';
import BottomTabBar from '~/component/tabbar';
import Detail from '~/screens/watchlist/Navigation/DetailScreen.marketActivity.js';
import ScreenId from '~/constants/screen_id';

import * as Business from '~/business';
import AddToWLScreen from '~s/portfolio/View/AddToWL/';
import CommonStyle from '~/theme/theme_controller'

import SCREEN from '~s/watchlist/screenEnum';
import { useAuth, useDetail } from '~s/watchlist';
import { useNavigator } from '~s/watchlist/TradeList/tradelist.hook';

import { useShowAddToWl } from '~s/portfolio/Hook/';
import * as Controller from '~/memory/controller'
import { clearInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js'
import * as ManageAppState from '~/manage/manageAppState';
import {
  setActiveScreen,
  setInactiveScreen
} from '~/manage/manageActiveScreen';
import ENUM from '~/enum';
import ErrorHandling from '~/screens/news_v3/Error/ErrorHandlingNews'
import Error from '~/component/error_system/Error.js'
import { dataStorage, func } from '~/storage'
import { getChannelShowMessageNews, getChannelHideOrderError } from '~/streaming/channel'
import * as Emitter from '@lib/vietnam-emitter';
import I18n from '~/modules/language/'
import ProgressBar from '~/modules/_global/ProgressBar';
import { updateAllowStreaming } from './Models/MarketActivityModel';
import { useUpdateChangeTheme } from '~/component/hook';
const { ACTIVE_STREAMING } = ENUM;

const getSymboInfoAndNews = (dispatch, listSymbol) => {
  const preList = useRef(listSymbol);
  useEffect(() => {
    if (_.isEmpty(listSymbol) || _.isEqual(preList.current, listSymbol)) {
      return;
    }
    dispatch.marketActivity.changeLoadingSymbolInfo({ isLoading: true });
    Business.getSymbolInfoMultiExchange1(listSymbol).then(
      (p) => {
        dispatch.marketActivity.changeLoadingSymbolInfo({ isLoading: false });
        // !_.isEqual(symbolInfo, p) && setSymbolInfo(p)
      }
    );
    // dispatch(WatchlistActions.watchListGetNewToday(listSymbol)); // HIDE - IRESS chưa support news in day
    preList.current = listSymbol;
  }, [listSymbol]);
};
const getErrorCode = (code) => {
  if (code === -1) {
    return I18n.t('accessInvalid')
  } else if (code === 1) {
    return I18n.t('invalidCodeExchange')
  } else if (code === 2) {
    return I18n.t('invalidCode')
  } else if (code === 3) {
    return I18n.t('invalidExchanges')
  } else if (code === 5) {
    return I18n.t('invalidAccess')
  }
  return ''
}
const showErrorMarketActivity = (errorCb, hideErrorFn) => {
  hideErrorFn && hideErrorFn({ type: 'error' })
  const codeError = useSelector(state => state.marketActivity.codeError)
  const messageError = useSelector(state => state.marketActivity.messageError)
  const marketWatchlist = useSelector(
    (state) => state.marketActivity.marketWatchlist
  );
  if (codeError) {
    return errorCb && errorCb(getErrorCode(codeError))
  }
}
const MarketActivity = ({ navigator, fromDrawer }) => {
  const marketWatchlist = useSelector(
    (state) => state.marketActivity.marketWatchlist, shallowEqual
  );
  // exchange, marketGroup, watchlist
  const channelShowMessage = getChannelShowMessageNews()
  const channelHideMessage = getChannelHideOrderError()
  const isLoadingState = useSelector(
    (state) => state.loading.effects.marketActivity.getMarketWatchlist, shallowEqual
  );
  const [refAddToWl, showAddToWl] = useShowAddToWl();
  const _list = useRef();

  // const [_auth, onAuth] = useAuth();
  const [_detail, showDetail] = useDetail();
  const refHeaderOfList = useRef()
  const showError = function (error) {
    Emitter.emit(channelShowMessage, { msg: error, type: ENUM.TYPE_MESSAGE.ERROR })
  };

  const hideErrorFn = function () {
    Emitter.emit(channelHideMessage)
  };
  showErrorMarketActivity(showError, hideErrorFn)
  const listSymbol = _.map(marketWatchlist, (item) => `${item.symbol}.${item.exchange}`);
  const listSymbolWithData = _.map(marketWatchlist, (item) => ({
    symbol: item.symbol,
    exchange: item.exchange,
    quote: {
      change_point: item.change_point,
      change_percent: item.change_percent,
      trade_price: item.trade_price
    }
  }));
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // const onLayout = useCallback((event) => {
  // 	const { x, y } = event.nativeEvent.layout;
  // 	setSize({ width: x, height: y });
  // }, []);

  const dispatch = useDispatch();

  const onEnd = useCallback(() => {
    _list.current && _list.current.onCreate();
  }, [_list.current]);
  const reloadScreen = useCallback(() => {
    try {
      refHeaderOfList.current.reloadApp && refHeaderOfList.current.reloadApp()
    } catch (error) {
      console.log('ERROR MARKET ACTIVITY SYSTEMS', error)
    }
  }, [])
  // getSnapshot
  useLayoutEffect(() => {
    func.setCurrentScreenId(ScreenId.MARKET_ACTIVITY);
    updateAllowStreaming(true)
  }, [])
  useEffect(() => {
    const isLogin = Controller.getLoginStatus()
    isLogin && dispatch.marketActivity.getMarketExchange();
    isLogin && dispatch.marketActivity.getMarketGroup();
    return () => { };
  }, []);

  useEffect(() => {
    if (fromDrawer) {
      setIsFirstLoad(false);
    }
  }, []);

  getSymboInfoAndNews(dispatch, listSymbol);

  useNavigator(navigator, {
    willAppear: () => {
      if (Controller.getStatusModalCurrent()) {
        return Controller.setStatusModalCurrent(false)
      } else {
        func.setCurrentScreenId(ScreenId.MARKET_ACTIVITY);
        updateAllowStreaming(true)
        dispatch.marketActivity.getMarketExchange();
        dispatch.marketActivity.getMarketGroup();
      }
    },
    didAppear: () => {
      setIsFirstLoad(false)
    },
    didDisappear: () => {
      if (Controller.getStatusModalCurrent()) {
        return;
      }
      if (dataStorage.tabIndexSelected !== 0) {
        clearInteractable && clearInteractable()
        setIsFirstLoad(true)
        setInactiveScreen(ACTIVE_STREAMING.MARKET_ACTIVITY)
        updateAllowStreaming(false)
      }
    }
  });
  // if (isFirstLoad) {
  // 	return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  // 		<ProgressBar color={CommonStyle.fontColor} />
  // 	</View>
  // }
  useUpdateChangeTheme(navigator)

  useLayoutEffect(() => {
    ManageAppState.registerAppStateChangeHandle(ScreenId.MARKET_ACTIVITY, reloadScreen)
    return () => {
      ManageAppState.unRegisterAppState(ScreenId.MARKET_ACTIVITY)
    }
  }, [])
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: CommonStyle.backgroundColor1,
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
    >
      <HandleWhenChangeNetwork reloadScreen={reloadScreen} />
      <HeaderBar navigator={navigator} />
      <View
        // onLayout={onLayout}
        style={{
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {!isFirstLoad && <HeaderFilter navigator={navigator} ref={refHeaderOfList} />}
        <NetworkWarning navigator={navigator} />
        <ErrorHandling channel={channelShowMessage} />
        <Error screenId={ScreenId.MARKET_ACTIVITY} onReTry={reloadScreen} />
        <Content
          showNewOrder={handleShowNewOrder}
          showAddToWl={showAddToWl}
          onRowPress={showDetail}
        />

      </View>

      <View pointerEvents="box-none" style={styles.detailContainer}>
        {!isFirstLoad && <Detail
          onHide={() => {
            func.setCurrentScreenId(ScreenId.MARKET_ACTIVITY);
          }}
          showAddToWl={showAddToWl}
          ref={_detail}
          onAuth={() => { }}
          navigator={navigator}
          listSymbol={listSymbolWithData}
          isHeaderLoading={isLoadingState}
        />}
        <AddToWLScreen
          showHideTabbar={() => { }}
          showHideBuySell={() => { }}
          ref={refAddToWl}
        />
      </View>

      <BottomTabBar
        index={0}
        ref={setRefTabbar}
        navigator={navigator}
        style={{ zIndex: 3 }}
      />
      <Modal isRematch />
      {
        isFirstLoad && <View style={[StyleSheet.absoluteFillObject, {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: CommonStyle.backgroundColor
        }]} >
          <ProgressBar color={CommonStyle.fontColor} />
        </View>
      }
    </View>
  );
};
const HandleWhenChangeNetwork = React.memo(({ reloadScreen }) => {
  const isConnected = useSelector((state) => state.app.isConnected, shallowEqual);
  const dispatch = useDispatch()
  const dic = useRef({ init: true })
  useEffect(() => {
    if (!dic.current.init) {
      const isLogin = Controller.getLoginStatus()
      isConnected && isLogin && reloadScreen()
    } else {
      dic.current.init = false
    }
  }, [isConnected])
  return null
}, () => true)
export default MarketActivity;

const styles = StyleSheet.create({
  detailContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 99
  },
  addContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100
  }
});
