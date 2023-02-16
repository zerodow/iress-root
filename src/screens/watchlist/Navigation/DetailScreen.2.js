import React, {
	useState,
	useEffect,
	useRef,
	useImperativeHandle,
	useCallback,
	forwardRef
} from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import BackDropView from '../Component/BackDropView.2';
import HeaderTradeList from '../Header/header.tradeList.2';
import NestedScrollView from '../Component/NestedScroll/WatchlistNested.2';
import SymbolDetail from '../Detail';
import BuySellButton from '../Detail/components/BuySellButton.2';
import HeaderPanner from '../Detail/components/HeaderPanner';
import CommonStyle from '~/theme/theme_controller';
import ShowHideComp from '../Detail/components/ShowHideAni.2';
import * as Business from '~/business';
import { DEVICE_HEIGHT } from '~s/watchlist/enum';
import { awaitCallback } from '../TradeList/tradelist.hook';
import Error from '~/component/error_system/Error.js';
import { func } from '~/storage';
import ScreenId from '~/constants/screen_id';
import { DelayComp } from '~s/watchlist';
import { useDispatch } from 'react-redux';
const { greaterThan, lessThan, Value } = Animated;

// const useChangeSymbol = (cb) => {
// 	const [{ symbol, exchange }, setSymbol] = useState({
// 		symbol: '',
// 		exchange: ''
// 	});
// 	const dispatch = useDispatch();
// 	const changeSymbol = useCallback((symbol, exchange) => {
// 		cb && cb();
// 		setTimeout(() => {
// 			setSymbol({ symbol, exchange });
// 			dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
// 		}, 10);
// 	}, []);

// 	return [symbol, exchange, changeSymbol];
// };

let CurHeaderPanner = ({ symbol, exchange, onCloseDetail, onRefresh }) => {
	const companyName = Business.getCompanyName({ symbol, exchange });
	// Tren con mi. Noi giua 2 view ma co mot gach trong suot lam cho khi vuot hien bi chop chop
	return (
		<View
			style={{
				paddingTop: 8,
				backgroundColor: CommonStyle.backgroundColor,
				borderTopLeftRadius: 22,
				borderTopRightRadius: 22,
				zIndex: 99999
				// top: -1
			}}
		>
			<HeaderPanner
				title={companyName}
				onClose={onCloseDetail}
				onRefresh={onRefresh}
			/>
			{/* <View style={{ height: 1 }} /> */}
		</View>
	);
};

CurHeaderPanner = React.memo(CurHeaderPanner);

let DetailScreen = (
	{
		navigator,
		listSymbol,
		isHeaderLoading,
		heightHeader,
		isDisableShowNewDetail,
		showAddToWl,
		onHide: onCallBackHide,
		changeAllowUnmount,
		showSearch
	},
	ref
) => {
	const [firstLoad, setfirstLoad] = useState(true);
	const _nested = useRef();
	const _header = useRef();
	const _detail = useRef();
	const refVerticalScroll = useRef();
	const [_panelTrans] = useState(() => new Value(DEVICE_HEIGHT + 100));
	const [_contentTrans] = useState(() => new Value(0));

	useEffect(() => {
		const timmer = setTimeout(() => {
			setfirstLoad(false);
		}, 10);
		return () => {
			timmer && clearTimeout(timmer);
		};
	}, []);

	// #region handle event
	const onChangeSymbol = useCallback(() => {
		func.setCurrentScreenId(ScreenId.SECURITY_DETAIL);
		awaitCallback(
			() => _nested.current,
			() => _nested.current.show()
		);
		awaitCallback(
			() => _header.current,
			() => _header.current.resetInfinit()
		);
		awaitCallback(
			() => _nested.current,
			() => _nested.current.reset()
		);
	}, []);
	const onCloseDetail = () => {
		_nested.current.hide();
	};
	const resetNested = useCallback(() => {
		_nested.current && _nested.current.reset && _nested.current.reset();
		_detail.current && _detail.current.reset && _detail.current.reset();
	}, []);

	// const [symbol, exchange, changeSymbol] = useChangeSymbol(onChangeSymbol);

	const [{ symbol, exchange }, setDetailInfo] = useState({
		symbol,
		exchange
	});

	const dispatch = useDispatch();

	const changeSymbol = (symbol, exchange) => {
		onChangeSymbol();
		setDetailInfo({ symbol, exchange });
		dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
		if (global.timerWL) {
			clearTimeout(global.timerWL);
		}
	};

	const onHide = () => {
		_header.current && _header.current.stop();
		onCallBackHide && onCallBackHide();
		setTimeout(() => {
			_nested.current && _nested.current.reset && _nested.current.reset();
			_detail.current && _detail.current.reset && _detail.current.reset();
		}, 300);

		global.timerWL && clearTimeout(global.timerWL);
		global.timerWL = setTimeout(() => {
			setDetailInfo({ symbol: '', exchange: '' });
			global.timerWL = null;
		}, 300);
	};
	const onRefresh = () => _detail.current.getSnapshot();
	// #endregion

	useImperativeHandle(ref, () => ({
		changeSymbol
	}));

	let headerTradelist = null;
	if (heightHeader) {
		headerTradelist = (
			<ShowHideComp
				endPosition={-DEVICE_HEIGHT / 3}
				_isHide={greaterThan(_panelTrans, 3)}
				_isShow={lessThan(_panelTrans, 3)}
			>
				<Animated.View style={{ height: heightHeader }} />
			</ShowHideComp>
		);
	} else {
		headerTradelist = [
			<BackDropView _scrollValue={_panelTrans} />,
			<ShowHideComp
				endPosition={-DEVICE_HEIGHT / 3}
				_isHide={greaterThan(_panelTrans, 3)}
				_isShow={lessThan(_panelTrans, 3)}
			>
				<HeaderTradeList
					ref={_header}
					onRowPress={changeSymbol}
					listSymbol={listSymbol}
					isLoading={isHeaderLoading}
				/>
			</ShowHideComp>
		];
	}

	if (firstLoad) return null;

	return (
		<React.Fragment>
			<BackDropView _scrollValue={_panelTrans} />
			{headerTradelist}
			<NestedScrollView
				refVerticalScroll={refVerticalScroll}
				_panelTrans={_panelTrans}
				_contentTrans={_contentTrans}
				ref={_nested}
				stylePanel={{
					backgroundColor: CommonStyle.backgroundColor1,
					borderTopLeftRadius: 28,
					borderTopRightRadius: 28
				}}
				hideCallback={onHide}
				listFooterComponent={() => (
					<DelayComp timeout={100}>
						<BuySellButton
							changeAllowUnmount={changeAllowUnmount}
							_scrollValue={_contentTrans}
							symbol={symbol}
							exchange={exchange}
						/>
					</DelayComp>
				)}
			>
				<DelayComp mergeWithPanel>
					<CurHeaderPanner
						symbol={symbol}
						exchange={exchange}
						onCloseDetail={onCloseDetail}
						onRefresh={onRefresh}
					/>
				</DelayComp>
				<DelayComp>
					<Error
						onReTry={onRefresh}
						screenId={ScreenId.SECURITY_DETAIL}
					/>
				</DelayComp>
				<SymbolDetail
					resetNested={resetNested}
					changeAllowUnmount={changeAllowUnmount}
					refVerticalScroll={refVerticalScroll}
					symbol={symbol}
					exchange={exchange}
					navigator={navigator}
					onClose={onCloseDetail}
					isDisableShowNewDetail={isDisableShowNewDetail}
					ref={_detail}
					showAddToWl={showAddToWl}
				/>
			</NestedScrollView>
		</React.Fragment>
	);
};

DetailScreen = forwardRef(DetailScreen);
DetailScreen = React.memo(DetailScreen);

export default DetailScreen;
