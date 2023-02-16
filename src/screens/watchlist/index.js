import React, {
	useCallback,
	useRef,
	useState,
	useEffect,
	useLayoutEffect,
	useImperativeHandle
} from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import _ from 'lodash';

import { setRefTabbar } from '~/lib/base/functionUtil';
import TradeList, { useSubData } from './TradeList';
import Detail from './Navigation/DetailScreen.2';
import HeaderBar from './Header';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import { func, dataStorage } from '~/storage';
import * as Controller from '../../memory/controller';
import HomePage from '~s/home/';

import BottomTabBar from '~/component/tabbar';
import AddToWLScreen from '~s/portfolio/View/AddToWL/';
import ScreenId from '~/constants/screen_id';
import Modal from './Component/Modal';
import {
	useNavigator,
	awaitCallback,
	useAppState
} from './TradeList/tradelist.hook';
import { handleShowNewOrder } from '~/screens/new_order/Controller/SwitchController.js';
import { useShowAddToWl } from '~s/portfolio/Hook/';
import Error from '~/component/error_system/Error.js';
import HandleReLoadApp from './HandleReLoadApp';
import { useDispatch } from 'react-redux';
import { useUpdateChangeTheme } from '~/component/hook';
// import ContingentBlock2 from '../new_order/Components/ContingentBlock2';

const WrapperComponent = ({ children }) => {
	if (Platform.OS === 'ios') {
		return <View style={styles.wrapContainer}>{children}</View>;
	}
	return (
		<KeyboardAvoidingView
			enabled={false}
			behavior="height"
			style={styles.wrapContainer}
		>
			{children}
		</KeyboardAvoidingView>
	);
};

const useModal = () => {
	const _modal = useRef();
	const showModal = useCallback(
		(p) => {
			_modal.current && _modal.current.showModal(p);
		},
		[_modal.current]
	);

	const closeModal = useCallback(
		(p) => {
			_modal.current && _modal.current.closeModal(p);
		},
		[_modal.current]
	);
	return [_modal, showModal, closeModal];
};

const useSearch = () => {
	const _search = useRef();
	const showSearch = useCallback(
		(p) => {
			_search.current && _search.current.showSearch(p);
		},
		[_search.current]
	);
	return [_search, showSearch];
};

export const useDetail = () => {
	const _detail = useRef();
	const dispatch = useDispatch();
	const onShowDetail = useCallback(
		({ symbol, exchange, handleShowAddSymbol, priceBoardSelected }) => {
			awaitCallback(
				() => _detail.current,
				() => {
					_detail.current.changeSymbol(
						symbol,
						exchange,
						true,
						handleShowAddSymbol,
						priceBoardSelected
					);
					// Call api market-info/symbol to get market_cap / pe_ratio / yearlyend_dividend
					dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
				}
			);
		},
		[_detail.current]
	);
	return [_detail, onShowDetail];
};

const SignIn = ({ loginState, onDidmount, navigator }) => {
	useEffect(() => {
		onDidmount && onDidmount(true);
	}, []);

	if (loginState) return null;
	return (
		<View
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				backgroundColor: CommonStyle.backgroundColor1
				// paddingTop: 100
			}}
		>
			{/* <ContingentBlock2 /> */}
			<HomePage navigator={navigator} />
		</View>
	);
};

export const DelayComp = ({ children, changeState, timeout = 0 }) => {
	const [firstLoad, setFirstLoad] = useState(true);
	useEffect(() => {
		let timmer = null;
		if (_.isNil(changeState)) {
			timmer = setTimeout(() => {
				setFirstLoad(false);
			}, timeout);
		} else if (changeState) {
			timmer = setTimeout(() => {
				setFirstLoad(false);
			}, timeout);
		}

		return () => timmer && clearTimeout(timmer);
	}, [changeState]);

	if (firstLoad) return null;
	return children || null;
};

const DefaultComp = ({ changeWebKey, navigator, fromDrawer }) => {
	const _bottomTabbar = useRef();
	const _indexAppear = useRef(0);
	const dispatch = useDispatch();
	const reloadAppRef = useRef();
	const dic = useRef({
		timeout: null,
		allowUnmount: true
	});
	const _list = useRef();
	const [_addToWL, showAddToWl] = useShowAddToWl();
	const [_detail, showDetail] = useDetail();
	const [_modal, showModal, closeModal] = useModal();
	const [_search, showSearch] = useSearch();

	const onOpenNewOrder = useCallback(handleShowNewOrder, []);
	const changeAllowUnmount = (allowUnmount) => {
		dic.current.allowUnmount = allowUnmount;
	};

	const { unSub, getAndSub } = useSubData(navigator);

	useAppState(getAndSub, () => {
		unSub();
		changeWebKey(Date.now());
	});

	useNavigator(navigator, {
		didAppear: () => {
			_indexAppear.current += 1;
			getAndSub();
			if (Controller.getStatusModalCurrent()) {
				Controller.setStatusModalCurrent(false);
				return;
			}
			setRefTabbar(_bottomTabbar.current);

			!fromDrawer &&
				func.setNavigatorGlobal({
					index: 1,
					navigator
				});
			func.setCurrentScreenId(ScreenId.WATCHLIST);
			if (dataStorage.isReloading) {
			} else {
				return (dataStorage.isReloading = true);
			}
		},
		didDisappear: () => {
			if (_indexAppear.current <= 0) {
				_indexAppear.current = 0;
			} else {
				_indexAppear.current -= 1;
				dispatch.subWatchlist.resetActions();
				unSub();
				changeWebKey(Date.now());
			}
		}
	});

	useUpdateChangeTheme(navigator);
	return (
		<WrapperComponent>
			<DelayComp timeout={100}>
				<HeaderBar
					changeAllowUnmount={changeAllowUnmount}
					_search={_search}
					showDetail={showDetail}
					navigator={navigator}
					showModal={showModal}
					closeModal={closeModal}
				/>
			</DelayComp>
			<HandleReLoadApp ref={reloadAppRef} />
			<Error
				navigator={navigator}
				screenId={ScreenId.WATCHLIST}
				onReTry={() => {
					reloadAppRef.current &&
						reloadAppRef.current.handleReloadApp &&
						reloadAppRef.current.handleReloadApp();
				}}
			/>
			<DelayComp>
				<TradeList
					ref={_list}
					onOpenNewOrder={onOpenNewOrder}
					onAddToWl={showAddToWl}
					onRowPress={showDetail}
					navigator={navigator}
					showModal={showModal}
					showSearch={showSearch}
					closeModal={closeModal}
				/>
			</DelayComp>
			<View pointerEvents="box-none" style={styles.detailContainer}>
				<Detail
					changeAllowUnmount={changeAllowUnmount}
					onHide={() => {
						func.setCurrentScreenId(ScreenId.WATCHLIST);
					}}
					onShow={() => {
						func.setCurrentScreenId(ScreenId.SECURITY_DETAIL);
					}}
					ref={_detail}
					navigator={navigator}
					showAddToWl={showAddToWl}
					showSearch={showSearch}
				/>
				<DelayComp timeout={400}>
					<AddToWLScreen ref={_addToWL} />
				</DelayComp>
			</View>
			<DelayComp timeout={150}>
				<BottomTabBar
					setRef={setRefTabbar}
					ref={_bottomTabbar}
					navigator={navigator}
					style={styles.tabbar}
					index={1}
				/>
			</DelayComp>
			<DelayComp>
				<Modal ref={_modal} />
			</DelayComp>
		</WrapperComponent>
	);
};

const WatchList = (props) => {
	const [webKey, changeWebKey] = useState(Date.now());
	const isLogin = Controller.getLoginStatus();
	const [loginState, setLoginState] = useState(
		dataStorage.isLoggedInOkta
			? dataStorage.isLoggedInOkta
			: props.fromDrawer
			? isLogin
			: false
	); // Nếu ở tab thì mặc định là false để khởi tạo absolute component / animation - ở drawer thì đã khởi tạo watchlist rồi nên lấy biến Controller.isLoginStatus()
	const [didMount, setDidmount] = useState(false);
	dataStorage.reloadAppAfterLogin = setLoginState;

	useEffect(() => {
		if (loginState) {
			!props.fromDrawer &&
				func.setNavigatorGlobal({
					index: 1,
					navigator: props.navigator
				});
			func.setCurrentScreenId(ScreenId.WATCHLIST);
		}
	}, [!!loginState]);

	return (
		<React.Fragment>
			<DelayComp timeout={300} changeState={didMount}>
				<DefaultComp {...props} changeWebKey={changeWebKey} />
			</DelayComp>

			<SignIn
				loginState={loginState}
				onDidmount={setDidmount}
				navigator={props.navigator}
			/>
		</React.Fragment>
	);
};

WatchList.navigatorStyle = { navBarHidden: true };

export default WatchList;

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		tabbar: { zIndex: 3 },
		wrapContainer: {
			flex: 1,
			backgroundColor: CommonStyle.backgroundColor1,
			position: 'absolute',
			width: '100%',
			height: '100%'
		},
		detailContainer: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			zIndex: 99
		}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
