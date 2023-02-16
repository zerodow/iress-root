import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useLayoutEffect
} from 'react';
import { View, Text, LayoutAnimation, UIManager } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import I18n from '~/modules/language/';
import CommonStyle from '~/theme/theme_controller';
import HandleData from '~s/orders/View/HandleData/';
import HandleAppState from '~s/orders/View/HandleAppState/';
import Header from '~s/orders/View/Header/';
import Content from '~s/orders/View/Content/';
import Footer from '~s/orders/View/Footer/';
import { dataStorage, func } from '~/storage';
import ScreenId from '~/constants/screen_id';
import SearchAccount from '~s/portfolio/View/SearchAccount/';
import Detail from '~s/orders/View/Detail/';
import ProgressBar from '~/modules/_global/ProgressBar';
import {
	useShowHideTabbar,
	useShowSearchAccount,
	useSetDetailSpaceTop
} from '~s/portfolio/Hook/';
import { useShowDetail } from '~s/orders/Hook/';
import ENUM from '~/enum';
import { getOrders } from '~s/orders/Controller/OrdersController';
import { changeLoadingState, resetFilterOrders } from '~s/orders/Redux/actions';
import { changeAnimationType } from '~/component/loading_component/Redux/actions';
import { destroy } from '~s/orders/Model/OrdersModel';
import Error from '~/component/error_system/Error.js';
import * as Controller from '~/memory/controller';
import { useUpdateChangeTheme } from '~/component/hook';

UIManager.setLayoutAnimationEnabledExperimental &&
	UIManager.setLayoutAnimationEnabledExperimental(true);
const { ANIMATION_TYPE } = ENUM;
const NetworkWarning = () => {
	const isConnectedRedux = useSelector((state) => state.app.isConnected);
	const [isConnected, setIsConnected] = useState(isConnectedRedux);
	useEffect(() => {
		if (isConnectedRedux !== isConnected) {
			LayoutAnimation.easeInEaseOut();
			setIsConnected(isConnectedRedux);
		}
	}, [isConnectedRedux, isConnected]);
	return isConnected ? (
		<View />
	) : (
		<View
			style={{
				width: '100%',
				backgroundColor: CommonStyle.color.sell,
				paddingVertical: 8
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontBlack,
					textAlign: 'center'
				}}
			>
				{I18n.t('connectingFirstCapitalize')}
			</Text>
		</View>
	);
};

const OrdersWrapper = ({ navigator }) => {
	const dispatch = useDispatch();
	const dic = useRef({
		active: true,
		symbol: null,
		exchange: null,
		currentPosition: {},
		timeoutLoadingPanel: null
	});
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [isFirstLoadPanel, setIsFirstLoadPanel] = useState(true);
	const [refDetail, showDetail, hideDetail, updateDataRealtime] =
		useShowDetail();
	const [refSearchAccount, showSearchAccount] = useShowSearchAccount();
	const [refFooter, showHideTabbar] = useShowHideTabbar();
	const refContent = useRef();
	const [setSpaceTop] = useSetDetailSpaceTop(refDetail);
	const updateActiveStatus = useCallback((newActive) => {
		dic.current.active = newActive;
	}, []);
	const handleSelectAccount = useCallback(() => {
		refContent.current.clearTextSearch &&
			refContent.current.clearTextSearch();
		dispatch(resetFilterOrders()); // reset filter orders when change account
		dispatch(changeAnimationType(ANIMATION_TYPE.FADE_IN_SPECIAL));
		dispatch(changeLoadingState(true));
		const isSortUpdated = true;
		getOrders({ isSortUpdated });
	}, []);
	const onNavigatorEvent = useCallback((event) => {
		switch (event.id) {
			case 'willAppear':
				func.setCurrentScreenId(ScreenId.ORDERS);
				break;
			case 'didAppear':
				if (dic.current.active) {
					setIsFirstLoad(false);
					dic.current.timeoutLoadingPanel = setTimeout(() => {
						setIsFirstLoadPanel(false);
					}, 1000);
					if (Controller.getStatusModalCurrent()) {
						return Controller.setStatusModalCurrent(false);
					}
					dispatch(changeLoadingState(true));
					const isSortUpdated = true;
					getOrders({ isSortUpdated });
				}
				func.setNavigatorGlobal({
					index: 4,
					navigator
				});
				func.setCurrentScreenId(ScreenId.ORDERS);
				updateActiveStatus(true);
				break;
			case 'didDisappear':
				if (dataStorage.tabIndexSelected !== 4) {
					dic.current.timeoutLoadingPanel &&
						clearTimeout(dic.current.timeoutLoadingPanel);
					// Reset filter and animation Type
					if (Controller.getStatusModalCurrent()) {
						return;
					}
					destroy(); // Reset orders model
					dispatch(resetFilterOrders()); // reset filter orders when change account
					dispatch(
						changeAnimationType(ANIMATION_TYPE.FADE_IN_SPECIAL)
					);
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
		return () => {
			dic.current.timeoutLoadingPanel &&
				clearTimeout(dic.current.timeoutLoadingPanel);
			// Reset filter and animation Type
			dispatch(resetFilterOrders()); // reset filter orders when change account
			dispatch(changeAnimationType(ANIMATION_TYPE.FADE_IN_SPECIAL));
			listener();
		};
	}, []);
	const onReTry = useCallback(() => {
		const isSortUpdated = true;
		getOrders({ isSortUpdated });
	}, []);
	useUpdateChangeTheme(navigator);
	return isFirstLoad ? (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: CommonStyle.backgroundColor1
			}}
		>
			<ProgressBar color={CommonStyle.fontColor} />
		</View>
	) : (
		<View
			style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor1 }}
		>
			<HandleAppState />
			<HandleData navigator={navigator} />
			<Header navigator={navigator} />
			<NetworkWarning />
			<Error screenId={ScreenId.ORDERS} onReTry={onReTry} />
			<Content
				ref={refContent}
				navigator={navigator}
				showSearchAccount={showSearchAccount}
				showHideTabbar={showHideTabbar}
				showDetail={showDetail}
				updateActiveStatus={updateActiveStatus}
			/>
			<Footer navigator={navigator} refFooter={refFooter} />
			{isFirstLoadPanel ? null : (
				<React.Fragment>
					<SearchAccount
						handleSelectAccount={handleSelectAccount}
						// setSpaceTop={setSpaceTop}
						showHideTabbar={showHideTabbar}
						ref={refSearchAccount}
					/>
					<Detail
						updateActiveStatus={updateActiveStatus}
						navigator={navigator}
						showHideTabbar={showHideTabbar}
						ref={refDetail}
					/>
				</React.Fragment>
			)}
		</View>
	);
};

export default OrdersWrapper;
