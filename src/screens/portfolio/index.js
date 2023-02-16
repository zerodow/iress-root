import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import Header from '~s/portfolio/View/Header/';
import Content from '~s/portfolio/View/Content/';
import Footer from '~s/portfolio/View/Footer/';
import CommonStyle from '~/theme/theme_controller';
import Detail from '~s/portfolio/View/Detail/';
import PortfolioButtonBuySell from '~s/portfolio/View/Detail/PortfolioButtonBuySell';

import {
	useShowDetail,
	useShowHideTabbar,
	useShowHideBuySell,
	useShowSearchAccount,
	useSetDetailSpaceTop,
	useShowAddToWl
} from '~s/portfolio/Hook/';
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController';
import { getAccActive } from '~s/portfolio/Model/PortfolioAccountModel';
import { changeLoadingState, resetPLState } from '~s/portfolio/Redux/actions';
import { dataStorage, func } from '~/storage';
import ScreenId from '~/constants/screen_id';
import SearchAccount from '~s/portfolio/View/SearchAccount/';
import AddToWLScreen from '~s/portfolio/View/AddToWL/';
import HandleData from '~s/portfolio/View/HandleData/';
import ProgressBar from '~/modules/_global/ProgressBar';
import NetworkWarning from '~/component/network_warning/network_warning_layout_animation';
import Error from '~/component/error_system/Error.js';
import * as ManageAppState from '~/manage/manageAppState';
import * as Controller from '~/memory/controller';
import _ from 'lodash';

const PortfolioWrapper = ({ navigator }) => {
	const dispatch = useDispatch();

	const updateActiveStatus = (newActive) => {
		dic.current.active = newActive;
	};
	const getActiveStatus = () => {
		return dic.current.active;
	};
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [isFirstLoadPanel, setIsFirstLoadPanel] = useState(true);
	const [refDetail, showDetail, hideDetail, updateDataRealtime] =
		useShowDetail();
	const [refSearchAccount, showSearchAccount] = useShowSearchAccount();
	const [refFooter, showHideTabbar] = useShowHideTabbar();
	const [refBuySell, showHideBuySell] = useShowHideBuySell();
	const [refAddToWl, showAddToWl] = useShowAddToWl();
	const [setSpaceTop] = useSetDetailSpaceTop(refDetail);
	const dic = useRef({
		active: true,
		symbol: null,
		exchange: null,
		currentPosition: {},
		timeoutLoadingPanel: null
	});
	const setSymbolExchange = useCallback(({ symbol, exchange, position }) => {
		dic.current.symbol = symbol;
		dic.current.exchange = exchange;
		dic.current.currentPosition = position;
	}, []);
	const getSymbolExchange = useCallback(() => {
		return {
			symbol: dic.current.symbol,
			exchange: dic.current.exchange,
			currentPosition: dic.current.currentPosition
		};
	}, []);
	const activeApp = useCallback(() => {
		dispatch(changeLoadingState(true));
		dispatch(resetPLState());
		const accAvtive = getAccActive();
		getPortfolioTotal(accAvtive);
	}, []);
	const onNavigatorEvent = useCallback((event) => {
		switch (event.id) {
			case 'willAppear':
				func.setCurrentScreenId(ScreenId.PORTFOLIO);
				break;
			case 'didAppear':
				if (getActiveStatus()) {
					setIsFirstLoad(false);
					dic.current.timeoutLoadingPanel = setTimeout(() => {
						setIsFirstLoadPanel(false);
					}, 1000);
					if (Controller.getStatusModalCurrent()) {
						return Controller.setStatusModalCurrent(false);
					}
					dispatch(changeLoadingState(true));
					dispatch(resetPLState());
					const accAvtive = getAccActive();
					getPortfolioTotal(accAvtive);
				}
				func.setNavigatorGlobal({
					index: 3,
					navigator
				});
				func.setCurrentScreenId(ScreenId.PORTFOLIO);
				updateActiveStatus(true);
				break;
			case 'didDisappear':
				if (Controller.getStatusModalCurrent()) {
					return;
				}
				if (dataStorage.tabIndexSelected !== 3) {
					updateActiveStatus(true);
					dic.current.timeoutLoadingPanel &&
						clearTimeout(dic.current.timeoutLoadingPanel);
					setIsFirstLoad(true);
					setIsFirstLoadPanel(true);
				}
				break;
			default:
				break;
		}
	}, []);
	useLayoutEffect(() => {
		const listener = navigator.addOnNavigatorEvent(onNavigatorEvent);
		ManageAppState.registerAppStateChangeHandle(
			ScreenId.PORTFOLIO,
			activeApp
		);
		return () => {
			dic.current.timeoutLoadingPanel &&
				clearTimeout(dic.current.timeoutLoadingPanel);
			ManageAppState.unRegisterAppState(ScreenId.PORTFOLIO);
			listener();
		};
	}, []);
	return isFirstLoad ? (
		<View
			style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
		>
			<ProgressBar color={CommonStyle.fontColor} />
		</View>
	) : (
		<View
			style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor1 }}
		>
			<HandleData navigator={navigator} />
			<Header navigator={navigator} />
			<NetworkWarning navigator={navigator} />
			<Error
				screenId={ScreenId.PORTFOLIO}
				onReTry={ManageAppState.reLoadScreenNow}
			/>
			<Content
				navigator={navigator}
				showSearchAccount={showSearchAccount}
				showHideTabbar={showHideTabbar}
				showHideBuySell={showHideBuySell}
				updateDataRealtime={updateDataRealtime}
				showDetail={showDetail}
			/>
			<Footer navigator={navigator} refFooter={refFooter} />
			{isFirstLoadPanel ? null : (
				<React.Fragment>
					<Detail
						zIndex={100}
						updateActiveStatus={updateActiveStatus}
						navigator={navigator}
						setSymbolExchange={setSymbolExchange}
						showAddToWl={showAddToWl}
						showHideTabbar={showHideTabbar}
						showHideBuySell={showHideBuySell}
						ref={refDetail}
					/>
					<PortfolioButtonBuySell
						navigator={navigator}
						zIndex={101}
						updateActiveStatus={updateActiveStatus}
						setSpaceTop={setSpaceTop}
						hideDetail={hideDetail}
						getSymbolExchange={getSymbolExchange}
						ref={refBuySell}
					/>
					<SearchAccount
						setSpaceTop={setSpaceTop}
						showHideTabbar={showHideTabbar}
						showHideBuySell={showHideBuySell}
						ref={refSearchAccount}
					/>
					<AddToWLScreen
						zIndex={201}
						showHideTabbar={showHideTabbar}
						showHideBuySell={showHideBuySell}
						ref={refAddToWl}
					/>
				</React.Fragment>
			)}
		</View>
	);
};

export default PortfolioWrapper;
