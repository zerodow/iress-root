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
import isEqual from 'react-fast-compare';
import _ from 'lodash';
import Animated from 'react-native-reanimated';
import produce from 'immer';

import Item from './tradeList.row';
import WatchListActions from '../reducers';
import * as Controller from '~/memory/controller';
import {
	BOTTOM_TABBAR_HEIGHT,
	HEIGHT_ROW,
	HEIGHT_SEPERATOR,
	DEVICE_HEIGHT,
	NUMBER_LIST
} from '~s/watchlist/enum';
import WatchlistHeader from '../Header/watchListHeader';
import Enum from '~/enum';
import HandleDataComp from '../handle_data.1';

import { useTiming } from './tradelist.hook';
import { createTiming } from '~s/watchlist/Animator/Timing';

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
	eq,
	floor,
	abs,
	neq,
	multiply,
	divide,
	interpolate,
	not,
	or
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
	const priceBoard = useSelector((state) => state.watchlist3.priceBoard);
	const priceBoardSelected = useSelector(
		(state) => state.watchlist3.priceBoardSelected
	);
	const dispatch = useDispatch();
	const setScreenActive = (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p));

	const isConnected = useSelector((state) => state.app.isConnected);
	const self = useRef();
	const [_heightHeader] = useState(new Value(0));
	const onLayout = useCallback(({ nativeEvent: { layout: { height } } }) => {
		_heightHeader.setValue(height);
	}, []);

	const { isIress } = priceBoard[priceBoardSelected] || {};

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
			isFavorites={priceBoardSelected === Enum.WATCHLIST.USER_WATCHLIST}
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
		const { priceBoard, priceBoardSelected } = state.watchlist3;
		const { value } = priceBoard[priceBoardSelected] || {};
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
		const { priceBoard } = state.watchlist3;
		const favoritesDetail = priceBoard[Enum.WATCHLIST.USER_WATCHLIST] || {};
		const objFavorites = _.keyBy(
			favoritesDetail.value || [],
			(item) => item.symbol + item.exchange
		);
		return objFavorites;
	}, isEqual);

const useData = () =>
	useSelector((state) => {
		const { marketData } = state.streamMarket;
		const { priceBoard, priceBoardSelected } = state.watchlist3;

		const priceBoardDetail = priceBoard[priceBoardSelected] || {};
		const { value: listSymbol, isIress = false } = priceBoardDetail || {};

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

const createDeleteBlock = ({
	_deleteStatus,
	_deleteTrans,
	_doingDeletes,
	trans,
	heightRow,
	index: i,
	finished,
	_timer
}) => {
	//  phan du startPost voi batchHeight
	const _offset = new Value(0);
	const _isDeleting = new Value(0);
	const _tmpOffset = new Value(0);

	const batchHeight = NUMBER_LIST * heightRow;
	const startPost = add(i * heightRow, _offset);

	const posItemInLatestBatch = sub(
		startPost,
		multiply(batchHeight, floor(divide(abs(startPost), batchHeight)))
	);

	const spaceItemToEnd = sub(batchHeight, posItemInLatestBatch, heightRow);

	return [
		_offset,
		[
			// handle deteleStatus === i
			// ex => 1 => 10 phan tu xoa phan tu 3
			cond(eq(_deleteStatus, i), [
				set(_deleteTrans, add(trans, startPost))
			]), //  duyen 1-> 10 , den i thi set deleteTrans
			cond(and(..._doingDeletes), [set(_deleteStatus, -1)]), //  da duyet het 1 luot => done

			cond(
				and(
					_doingDeletes[i],
					greaterOrEq(add(trans, startPost), _deleteTrans)
				),
				[set(_isDeleting, 1), set(_tmpOffset, _offset)]
			),

			cond(_doingDeletes[i], [set(_doingDeletes[i], 0)]), // chi cho chay 1 lan duy nhat
			i === 0 && // kich hoat 1 lan duy nhat
				cond(and(neq(_deleteStatus, -1), not(or(..._doingDeletes))), [
					..._doingDeletes.map((item) => set(item, 1))
				]),

			finished && i === 0 && cond(_doingDeletes[0], [set(finished, 0)]),
			// keo all xuong 1 row them timing
			_timer &&
				cond(
					and(_isDeleting, not(finished)),
					set(
						_offset,
						interpolate(_timer, {
							inputRange: [0, heightRow],
							outputRange: [
								_tmpOffset,
								sub(_tmpOffset, heightRow)
							]
						})
					)
				),
			// done thi set dung vi tri cac item
			finished &&
				cond(and(_isDeleting, finished), [
					set(_offset, sub(_tmpOffset, heightRow)),
					set(_isDeleting, 0),
					cond(
						eq(add(trans, startPost), add(_deleteTrans, _offset)),
						[
							set(
								// nhet xuong day
								// nhet 3 xuong day
								_offset,
								add(_offset, spaceItemToEnd)
							)
						]
					)
				])
		]
	];
};

export const createMoveAnimater = ({
	_scrollValue,
	onChange,
	_heightLimit,
	heightRow = HEIGHT_EARCH_ROW,
	finished,
	_timer
}) => {
	let _dic = {};
	const result = {};
	const batchHeight = NUMBER_LIST * heightRow;

	const _deleteTrans = new Value(0);
	const _deleteStatus = new Value(-1);
	const _doingDeletes = [];
	for (let i = 0; i < NUMBER_LIST; i++) {
		_doingDeletes[i] = new Value(0);
	}

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
		const [_offset, deleteBlock] = createDeleteBlock({
			_deleteStatus,
			_deleteTrans,
			_doingDeletes,
			trans,
			heightRow,
			index: i,
			finished,
			_timer
		});
		const startPost = add(i * heightRow, _offset);

		const hideInTop = lessThan(
			add(tmpTrans, startPost),
			sub(_scrollValue, HIDE_OFFSET)
		);

		const hideInBottom = greaterThan(
			add(tmpTrans, startPost),
			add(_scrollValue, DEVICE_HEIGHT - HIDE_OFFSET)
		);

		const isInRange = and(
			greaterOrEq(add(tmpTrans, startPost), 0),
			lessOrEq(add(tmpTrans, startPost), _heightLimit)
		);

		result[i] = block([
			...deleteBlock,

			// (scroll from bottom to top) => translate to bottom when hide on top
			cond(hideInTop, [set(tmpTrans, add(tmpTrans, batchHeight))]),
			// (scroll from top to bottom) => translate to top when hide on bottom
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

			add(trans, _offset)
		]);
	}

	const onDelete = (index) => {
		_deleteStatus.setValue(index);
	};

	return [result, onDelete];
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

let ListDataOfItem = (
	{ _scrollValue, setData, setSize, heightRow = HEIGHT_EARCH_ROW },
	ref
) => {
	const [itemDataIndexs, onChange] = useState({}); // as index of data
	const [_heightLimit] = useState(() => new Value(0));
	const [_timer, finished, timerBlock] = createTiming(0, heightRow, 100);

	const [[_arrTrans, onDelete]] = useState(() =>
		createMoveAnimater({
			_scrollValue,
			onChange,
			_heightLimit,
			heightRow,
			finished,
			_timer
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
		// setTimeout(() => {
		//     console.info('moe');
		//     onDelete && onDelete(3);
		// }, 7000);
	}, []);

	useImperativeHandle(ref, () => ({
		onDelete
	}));

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
	return <Animated.Code exec={timerBlock} />;
};

ListDataOfItem = forwardRef(ListDataOfItem);
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

export let ListContent = ({ onAddToWl, onOpenNewOrder, onRowPress }, ref) => {
	const dispatch = useDispatch();
	const dicData = useRef([]);
	const _scroll = useRef();
	const _listData = useRef();

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

	const onDelete = useCallback(
		(index) => {
			const { marketData } = dicData.current[index] || {};
			const { symbol, exchange } = marketData;
			dispatch.priceBoard.addOrRemoveSymbol({
				symbol,
				exchange,
				isDelete: true
			});
			_listData.current && _listData.current.onDelete(index);
		},
		[_listData.current]
	);
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

	let height = NUMBER_LIST * HEIGHT_EARCH_ROW;
	if (!isLoading) {
		height = sizeMarketData * HEIGHT_EARCH_ROW + HEIGHT_SEPERATOR;
	}

	return (
		<React.Fragment>
			<ListDataOfItem
				ref={_listData}
				_scrollValue={_scrollValue}
				setData={setData}
				setSize={setSize}
			/>
			<AnimatedScroll ref={_scroll} _scrollValue={_scrollValue}>
				<Animated.Code exec={timerBlock} />
				<Animated.View
					style={{
						height,
						marginTop: HEIGHT_SEPERATOR
					}}
				>
					{content}
				</Animated.View>
				<ListFooterComponent />
			</AnimatedScroll>
		</React.Fragment>
	);
};

ListContent = forwardRef(ListContent);
ListContent = React.memo(ListContent);
