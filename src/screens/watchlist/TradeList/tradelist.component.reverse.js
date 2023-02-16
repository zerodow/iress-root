/**
 * Revert fix bug crash on market activity
 */
import React, {
	useCallback,
	useState,
	useRef,
	useImperativeHandle,
	forwardRef,
	useEffect,
	useMemo
} from 'react';
import { View, ScrollView as RNScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import Animated from 'react-native-reanimated';
import produce from 'immer';
import isEqual from 'react-fast-compare';

import Item from './tradeList.row';
import WatchListActions from '../reducers';
import * as Controller from '~/memory/controller';
import {
	HEIGHT_FOOTER,
	BOTTOM_TABBAR_HEIGHT,
	HEIGHT_ROW,
	HEIGHT_SEPERATOR,
	DEVICE_HEIGHT,
	NUMBER_LIST
} from '~s/watchlist/enum';
import WatchlistHeader from '../Header/watchListHeader';
import Enum from '~/enum';
import HandleDataComp from '../handle_data.1';
import VirtualList from './tradelist.virtual';

import { useTiming } from './tradelist.hook';

const {
	Value,
	event,
	block,
	call,
	lessThan,
	lessOrEq,
	greaterThan,
	greaterOrEq,
	add,
	sub,
	set,
	cond,
	debug,
	diff,
	and,
	eq
} = Animated;

const HEIGHT_EARCH_ROW = HEIGHT_ROW + HEIGHT_SEPERATOR;
const ScrollView = Animated.createAnimatedComponent(RNScrollView);

export let ListFooterComponent = () => (
	<View style={{ height: BOTTOM_TABBAR_HEIGHT }} />
);
ListFooterComponent = React.memo(ListFooterComponent);

export let Header = (
	{ _scrollValue, navigator, showModal, closeModal },
	ref
) => {
	const subTitle = useSelector((state) => state.watchlist3.subTitle);
	const [isIress, isFavorites] = useSelector((state) => {
		const { priceBoardSelected, staticPriceBoard } = state.priceBoard;
		const isIress = !!staticPriceBoard[priceBoardSelected];
		const isFavorites =
			priceBoardSelected === Enum.WATCHLIST.USER_WATCHLIST;
		return [isIress, isFavorites];
	}, isEqual);
	const isConnected = useSelector((state) => state.app.isConnected);

	const dispatch = useDispatch();
	const setScreenActive = (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p));

	const self = useRef();
	const [_heightHeader] = useState(new Value(0));
	const onLayout = useCallback(({ nativeEvent: { layout: { height } } }) => {
		_heightHeader.setValue(height);
	}, []);

	useImperativeHandle(ref, () => ({
		updateTime: () =>
			self.current && self.current.updateTime(new Date().getTime()),
		_heightHeader
	}));

	return (
		<WatchlistHeader
			ref={self}
			onLayout={onLayout}
			_scrollValue={_scrollValue}
			navigator={navigator}
			subTitle={subTitle}
			isConnected={isConnected}
			setScreenActive={setScreenActive}
			iressTag={isIress}
			isFavorites={isFavorites}
			showModal={showModal}
			closeModal={closeModal}
		/>
	);
};

Header = forwardRef(Header);
Header = React.memo(Header);

export let HandleData = ({ navigator, _header }, ref) => {
	const self = useRef();

	const listSymbol = useSelector((state) => {
		const {
			priceBoardSelected,
			userPriceBoard,
			staticPriceBoard
		} = state.priceBoard;

		const { value } =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};

		return value;
	}, isEqual);

	const userId = Controller.getUserId();
	const setTimeUpdate = useCallback(() => {
		_header.current && _header.current.updateTime();
	}, []);

	useImperativeHandle(ref, () => ({
		onRefreshData: () => self.current && self.current.getSnapshot()
	}));

	return (
		<HandleDataComp
			setTimeUpdate={setTimeUpdate}
			ref={self}
			userId={userId}
			navigator={navigator}
			listSymbol={listSymbol}
			isWatchList
		/>
	);
};

HandleData = forwardRef(HandleData);
HandleData = React.memo(HandleData);

const useFavoritesData = () =>
	useSelector((state) => {
		const { userPriceBoard } = state.priceBoard;
		const favoritesDetail =
			userPriceBoard[Enum.WATCHLIST.USER_WATCHLIST] || {};
		const objFavorites = _.keyBy(
			favoritesDetail.value || [],
			(item) => item.symbol + item.exchange
		);
		return objFavorites;
	}, isEqual);

const useData = () =>
	useSelector((state) => {
		const { marketData } = state.streamMarket;
		const {
			priceBoardSelected,
			userPriceBoard,
			staticPriceBoard
		} = state.priceBoard;

		const priceBoardDetail =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};
		const isIress = !!staticPriceBoard[priceBoardSelected];

		const { value: listSymbol } = priceBoardDetail || {};
		const result = [];
		_.forEach(listSymbol, (item, index) => {
			const { symbol, exchange } = item;
			const { quote = {} } =
				(marketData &&
					marketData[exchange] &&
					marketData[exchange][symbol]) ||
				{};

			if (!result[index]) {
				result[index] = {};
			}

			result[index].symbol = symbol;
			result[index].exchange = exchange;
			result[index].quote = quote;
			result[index].isIress = isIress;
		});

		return result;
	}, isEqual);

export const createMoveAnimater = ({
	_scrollValue,
	onChange,
	_heightLimit,
	heightRow = HEIGHT_EARCH_ROW
}) => {
	let _dic = {};
	const result = {};
	const batchHeight = NUMBER_LIST * heightRow;

	const handeChange = (i, isUpper, isReset) => {
		_dic = produce(_dic, (draft) => {
			if (_.isNil(draft[i])) {
				draft[i] = i;
			}
			if (isReset) {
				draft[i] = i;
			} else {
				draft[i] = isUpper
					? draft[i] + NUMBER_LIST
					: draft[i] - NUMBER_LIST;
			}
		});
		const debounce = _.debounce(() => onChange(_dic), 50);
		debounce();
	};

	for (let i = 0; i < NUMBER_LIST; i++) {
		const HIDE_OFFSET = 150;
		const tmpTrans = new Value(0);
		const trans = new Value(0);
		const diffValue = diff(trans);

		// const curPos = add(tmpTrans, i * heightRow); <=> set() => static

		const hideInTop = lessThan(
			add(tmpTrans, i * heightRow),
			sub(_scrollValue, HIDE_OFFSET)
		);

		const hideInBottom = greaterThan(
			add(tmpTrans, i * heightRow),
			add(_scrollValue, DEVICE_HEIGHT - HIDE_OFFSET)
		);

		const isInRange = and(
			greaterOrEq(add(tmpTrans, i * heightRow), 0),
			lessOrEq(add(tmpTrans, i * heightRow), _heightLimit)
		);

		result[i] = block([
			// (scroll from bottom to top) => translate to bottom when hide on top
			cond(hideInTop, set(tmpTrans, add(tmpTrans, batchHeight))),
			// (scroll from top to Bototm) => translate to top when hide on bottom
			cond(
				hideInBottom,
				cond(
					eq(_scrollValue, 0),
					set(tmpTrans, 0),
					set(tmpTrans, sub(tmpTrans, batchHeight))
				)
			),

			// limit top , bottom of list
			cond(isInRange, [set(trans, tmpTrans)]),
			// trigger when move row
			cond(
				diffValue,
				call([diffValue, trans], ([d, t]) => {
					handeChange(i, d > 0, t === 0);
				})
			),
			trans
		]);
	}
	return result;
};

const createContent = ({
	_timer,
	data,
	sizeMarketData,
	firstLoading,
	actions,
	isLoading
}) => {
	const dicActions = useRef();
	const dicIndexActions = useRef();
	const content = [];

	const sizeItem = isLoading
		? NUMBER_LIST
		: Math.min(NUMBER_LIST, sizeMarketData);
	const { isIress } = (data[0] && data[0].marketData) || {};

	const onSnap = useCallback(
		(i, onReset, itemIndex) => {
			if (
				i !== (isIress ? 0 : 1) &&
				dicIndexActions.current !== itemIndex
			) {
				dicIndexActions.current = itemIndex;
				dicActions.current &&
					dicActions.current({ index: isIress ? 0 : 1 });
				dicActions.current = onReset;
			}
		},
		[isIress]
	);

	useEffect(() => {
		dicActions.current && dicActions.current({ index: isIress ? 0 : 1 });
		dicActions.current = null;
	}, [sizeMarketData, isIress]);

	for (let index = 0; index < sizeItem; index++) {
		const { _trans, marketData } = data[index] || {};
		const transform = [
			{
				translateY: index * HEIGHT_EARCH_ROW
			},
			{
				translateY: _trans || 0
			}
		];

		content.push(
			<Animated.View
				key={index}
				style={{
					width: '100%',
					position: 'absolute',
					transform
				}}
			>
				<Item
					{...actions}
					onSnap={onSnap}
					index={index}
					item={marketData}
					isLoading={firstLoading}
					_trans={_trans}
					_timer={_timer}
				/>
			</Animated.View>
		);
	}

	return content;
};

let ListDataOfItem = ({ _scrollValue, setData, setSize }) => {
	const [itemDataIndexs, onChange] = useState({}); // as index of data
	const [_heightLimit] = useState(() => new Value(0));
	const [_arrTrans] = useState(() =>
		createMoveAnimater({
			_scrollValue,
			onChange,
			_heightLimit
		})
	);

	const arrMarketData = useData();
	const favorites = useFavoritesData();

	const sizeData = _.size(arrMarketData);
	useEffect(() => {
		_heightLimit.setValue((sizeData - 1) * HEIGHT_EARCH_ROW);
		setSize(sizeData);
	}, [sizeData]);

	useEffect(() => {
		setData(_.map(_arrTrans, (_trans) => ({ _trans }))); // had NUMBER_LIST item)
	}, []);

	useEffect(() => {
		setData((p) =>
			produce(p, (draft) => {
				_.forEach(draft, (item, index) => {
					draft[index].marketData = {
						...(arrMarketData[itemDataIndexs[index] || index] || {})
					};

					const { symbol, exchange } = draft[index].marketData || {};
					const isInFavorites = !!favorites[symbol + exchange];
					draft[index].marketData.isInFavorites = isInFavorites;
				});
			})
		);
	}, [itemDataIndexs, favorites, arrMarketData, setData]);
	return null;
};

ListDataOfItem = React.memo(ListDataOfItem);

export let AnimatedScroll = ({ _scrollValue, children, ...props }, ref) => {
	const _scroll = useRef();
	useImperativeHandle(ref, () => ({
		reset: () =>
			_scroll.current &&
			_scroll.current.getNode &&
			_scroll.current.getNode().scrollTo({ y: 0, animated: false })
	}));

	return (
		<ScrollView
			ref={_scroll}
			onRefresh={undefined}
			removeClippedSubviews={false}
			scrollEventThrottle={1}
			showsVerticalScrollIndicator={false}
			// decelerationRate={0.98}
			scrollEventThrottle={2}
			onScroll={event([
				{
					nativeEvent: {
						contentOffset: {
							y: _scrollValue
						}
					}
				}
			])}
			{...props}
		>
			{children}
		</ScrollView>
	);
};

AnimatedScroll = forwardRef(AnimatedScroll);

export let ListContent = ({ onAddToWl, onRowPress, onOpenNewOrder }, ref) => {
	const dispatch = useDispatch();
	const dicData = useRef([]);
	const _scroll = useRef();

	const [firstLoading, setFirstLoad] = useState(true);
	const [_timer, finished, timerBlock] = useTiming(0, 1000, 1000, () =>
		setFirstLoad(false)
	);

	const [_scrollValue] = useState(() => new Value(0));
	const [data, setData] = useState([]);
	const [sizeMarketData, setSize] = useState(0);
	dicData.current = data;

	const onPress = useCallback((index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange } = marketData;
		onRowPress && onRowPress({ symbol, exchange });
	}, []);

	const onAdd = useCallback((index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange } = marketData;
		onAddToWl && onAddToWl({ symbol, exchange });
	}, []);
	const onPressNewOrder = useCallback((index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange } = marketData;
		onOpenNewOrder && onOpenNewOrder({ symbol, exchange });
	}, []);

	const onChange = useCallback((index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange, isInFavorites } = marketData;
		dispatch.priceBoard.addOrRemoveSymbol({
			symbol,
			exchange,
			priceboardId: Enum.WATCHLIST.USER_WATCHLIST
		});
	}, []);

	const onDelete = useCallback((index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange } = marketData;
		dispatch.priceBoard.addOrRemoveSymbol({
			symbol,
			exchange,
			isDelete: true
		});
	}, []);
	const isLoadingState = useSelector(
		(state) => state.watchlist3.isLoadingState
	);

	const isLoading = (!sizeMarketData && isLoadingState) || firstLoading;

	const content = createContent({
		_timer,
		data,
		sizeMarketData,
		isLoading,
		firstLoading,
		actions: {
			onRowPress: onPress,
			onAddToWl: onAdd,
			changeFavourites: onChange,
			onDelete,
			onPressNewOrder
		}
	});

	useImperativeHandle(ref, () => ({
		reset: () => _scroll.current && _scroll.current.reset()
	}));

	const style = {
		height: isLoading
			? NUMBER_LIST * HEIGHT_EARCH_ROW
			: sizeMarketData * HEIGHT_EARCH_ROW + HEIGHT_SEPERATOR,
		marginTop: HEIGHT_SEPERATOR
	};

	return (
		<React.Fragment>
			<ListDataOfItem
				_scrollValue={_scrollValue}
				setData={setData}
				setSize={setSize}
			/>
			<AnimatedScroll ref={_scroll} _scrollValue={_scrollValue}>
				<Animated.Code exec={timerBlock} />
				<Animated.View style={style}>{content}</Animated.View>
				<ListFooterComponent />
			</AnimatedScroll>
		</React.Fragment>
	);
};

ListContent = forwardRef(ListContent);
ListContent = React.memo(ListContent);
