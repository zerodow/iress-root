import _ from 'lodash';
import Animated from 'react-native-reanimated';
import isEqual from 'react-fast-compare';
import React, {
	useState,
	useRef,
	useEffect,
	forwardRef,
	useCallback,
	useImperativeHandle
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import produce from 'immer';

import {
	HEIGHT_ROW,
	HEIGHT_SEPERATOR,
	DEVICE_HEIGHT,
	NUMBER_LIST
} from '~s/watchlist/enum';
import { createTiming } from '~s/watchlist/Animator/Timing';

const {
	Value,
	abs,
	add,
	and,
	block,
	call,
	cond,
	divide,
	eq,
	floor: aniFloor,
	greaterOrEq,
	greaterThan,
	interpolate,
	lessOrEq,
	lessThan,
	modulo: aniModulo,
	multiply,
	neq,
	not,
	or,
	set,
	sub,
	max,
	min
} = Animated;

const HIDE_OFFSET = 150;
const HEIGHT_EARCH_ROW = HEIGHT_ROW + HEIGHT_SEPERATOR;

const handleDuplicate = (list, item, isUpper) => {
	if (!_.includes(list, item)) {
		return item;
	} else {
		return handleDuplicate(list, isUpper ? item + 1 : item - 1, isUpper);
	}
};

const createnewDic = () => {
	const newDic = {};
	for (let i = 0; i < NUMBER_LIST; i++) {
		newDic[i] = i;
	}

	return newDic;
};

const floor = (item) =>
	cond(lessOrEq(item, 0), add(aniFloor(item), 1), aniFloor(item));

const modulo = (item1, item2) =>
	cond(
		lessOrEq(item1, 0),
		sub(item2, aniModulo(item1, item2)),
		aniModulo(item1, item2)
	);

const createDeleteBlock = (
	heightRow,
	finished,
	_deleteTimer,
	_deleteStatus,
	items,
	_sizeData
) => {
	const _deleteTrans = new Value(0);
	const _countTrans = new Value(0); // dem so luong item dich chuyen để di chuyển item delete xuống dưới cùng
	const _doingDeletes = [];
	const batchHeight = NUMBER_LIST * heightRow;

	for (let i = 0; i < NUMBER_LIST; i++) {
		_doingDeletes[i] = new Value(0);
	}

	const result = [];

	const canMoveToBottom = new Value(-1);

	for (let i = 0; i < NUMBER_LIST; i++) {
		const _offset = new Value(0);
		const _isDeleting = new Value(0); // doing timing delete
		const _tmpOffset = new Value(0);
		const itemPosition = new Value(i * heightRow);

		const _maxHeight = multiply(_sizeData, heightRow);

		//  phan du itemPosition voi batchHeight
		const posItemOnUIBatch = modulo(itemPosition, batchHeight);
		const batchPos = sub(itemPosition, posItemOnUIBatch);
		const isEndlessBatch = greaterOrEq(
			add(batchPos, batchHeight),
			_maxHeight
		);

		const spaceItemToEnd = sub(
			cond(isEndlessBatch, modulo(_maxHeight, batchHeight), batchHeight),
			posItemOnUIBatch,
			heightRow
		);

		// thu tu chay :
		// luot 1 :
		// => change all _doingDeletes to 1
		// => kich hoat timing
		// => _deleteStatus === i => set _deleteTrans
		// luot 2 (ke tu khi co _deleteTrans va _doingDeletes[i]) :
		// => set _isDeleting true , luu offset hien tai
		// => set luon _doingDeletes[i] false (dame bao 1 item chi chay 1 lan)
		// => _isDeleting(con timing) => set lien tuc offset =>  done set _isDeleting false
		// =>  thang bi delete nhet xuong cuoi batch

		const doingOnce = [
			cond(eq(_deleteStatus, i), [set(_deleteTrans, itemPosition)]), //  duyen 1-> 10 , den i thi set deleteTrans

			cond(and(..._doingDeletes), [set(_deleteStatus, -1)]), //  khong con thang nao dang chay timing xoa => done
			cond(
				and(_doingDeletes[i], greaterOrEq(itemPosition, _deleteTrans)),
				[
					set(_isDeleting, 1),
					set(_tmpOffset, _offset),
					set(_countTrans, add(_countTrans, 1))
				]
			),

			cond(_doingDeletes[i], [set(_doingDeletes[i], 0)]) // chi cho chay 1 lan duy nhat
		];

		let runOnlyOnce = [];
		if (i === 0) {
			runOnlyOnce = [
				cond(
					and(neq(_deleteStatus, -1), not(or(..._doingDeletes))),
					_doingDeletes.map((item) => set(item, 1))
				), //  all _doingDeletes is 0 => change all _doingDeletes to 1
				finished && cond(_doingDeletes[0], set(finished, 0)) // kich hoat timing xoa
			];
		}

		const runTiming = cond(
			and(_isDeleting, not(finished)),
			set(
				_offset,
				interpolate(_deleteTimer, {
					inputRange: [0, heightRow],
					outputRange: [_tmpOffset, sub(_tmpOffset, heightRow)]
				})
			)
		);

		const moveBottomWhenDone = cond(neq(canMoveToBottom, -1), [
			cond(eq(canMoveToBottom, i), [
				set(_sizeData, max(sub(_sizeData, 1), 0)),
				set(canMoveToBottom, -1),
				set(
					// nhet xuong day
					// nhet 3 xuong day
					_offset,
					add(_offset, multiply(_countTrans, heightRow))
				),

				set(_countTrans, 0)
			])
		]);

		const doneTiming = cond(and(_isDeleting, finished), [
			..._doingDeletes.map((item) => set(item, 0)),
			set(_offset, sub(_tmpOffset, heightRow)),
			set(_isDeleting, 0),
			cond(eq(itemPosition, _deleteTrans), [set(canMoveToBottom, i)])
		]);

		result.push([
			_offset,
			[
				// handle deteleStatus === i
				// ex => 1 => 10 phan tu xoa phan tu 3
				...doingOnce,
				...runOnlyOnce,
				// keo all xuong 1 row them timing
				_deleteTimer && runTiming,
				// done thi set dung vi tri cac item
				finished && moveBottomWhenDone,
				finished && doneTiming,
				cond(finished, set(itemPosition, items[i]))
			],
			_tmpOffset
		]);
	}
	return result;
};

const useData = () =>
	useSelector((state) => {
		const isLoadingState =
			state.loading.effects.priceBoard.getUserPriceBoard ||
			// state.loading.effects.priceBoard.getStaticPriceBoard ||
			state.loading.effects.priceBoard.selectPriceBoard;

		const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
			state.priceBoard;
		const priceBoardDetail =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};

		const isIress = !!staticPriceBoard[priceBoardSelected];

		const { value: listSymbol } = priceBoardDetail || {};

		const result = {};
		_.forEach(listSymbol, (item, index) => {
			const { symbol, exchange } = item;
			const quote = state.quotes.data[symbol + '#' + exchange];
			const key = symbol + exchange;

			if (!result[key]) {
				result[key] = {};
			}

			result[key].symbol = symbol;
			result[key].exchange = exchange;
			result[key].quote = quote;
			result[key].isIress = isIress;
		});

		return [result, isLoadingState];
	}, isEqual);

const useMapData = () => {
	const self = useRef(0);
	const _dicListSymbol = useRef([]);
	const [mapData, setMapdata] = useState([]);
	const priceBoardSelected = useSelector(
		(state) => state.priceBoard.priceBoardSelected
	);
	const listSymbol = useSelector((state) => {
		const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
			state.priceBoard;

		const priceBoardDetail =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};
		const { value } = priceBoardDetail || {};
		return value;
	}, isEqual);

	_dicListSymbol.current = _.map(
		listSymbol,
		({ exchange, symbol }) => symbol + exchange
	);

	const reset = useCallback(() => {
		setMapdata(_dicListSymbol.current);
		self.current = _.size(_dicListSymbol.current);
	}, []);

	useEffect(() => {
		reset();
	}, [priceBoardSelected]);

	useEffect(() => {
		if (_.size(listSymbol) > self.current) {
			setMapdata(_dicListSymbol.current);
		}
		self.current = _.size(listSymbol);
	}, [listSymbol]);

	return [mapData, reset];
};

export const createMoveAnimater = ({
	_deleteTimer,
	_sizeData,
	_scrollValue: _trans, //  start position of UI compare with scrollValue 0
	finished,
	heightRow = HEIGHT_EARCH_ROW,
	onChange
}) => {
	const batchHeight = NUMBER_LIST * heightRow;
	const _limitTrans = multiply(_sizeData, heightRow);

	// const _batchPos = sub(_trans, modulo(_trans, batchHeight));
	// const _maxBatch = sub(_limitTrans, modulo(_limitTrans, batchHeight));

	const _batchPos = multiply(batchHeight, floor(divide(_trans, batchHeight)));
	const _maxBatch = multiply(
		batchHeight,
		floor(divide(_limitTrans, batchHeight))
	);

	const _limitBatch = max(0, min(_batchPos, _maxBatch));
	let _dic = createnewDic();
	let _dicDelete = [];
	const resetting = new Value(0);

	// let _ui = {};

	const handleItem = (i, _offset, finished, _tmpResult) => {
		// const _tmpPos = add(_limitBatch, i * heightRow, _offset);
		const _result = new Value(i * heightRow);
		const _diff = new Value(0);

		const _originalPos = add(_limitBatch, i * heightRow);

		return cond(
			finished,
			[
				set(_result, add(_originalPos, _offset)),
				// i === 3 && debug('_offset 1', _offset),
				cond(lessThan(_result, sub(_trans, HIDE_OFFSET)), [
					set(_offset, add(_offset, batchHeight)),
					set(_result, add(_originalPos, _offset))
				]),
				// i === 3 && debug('_offset 2', _offset),
				cond(
					greaterThan(
						_result,
						add(_trans, DEVICE_HEIGHT, -HIDE_OFFSET)
					),
					[
						set(_offset, sub(_offset, batchHeight)),
						set(_result, add(_originalPos, _offset))
					]
				),
				// i === 3 && debug('_offset 3', _offset),
				cond(lessThan(_result, sub(0, divide(heightRow, 2))), [
					set(_offset, add(_offset, batchHeight)),
					set(_result, add(_originalPos, _offset))
				]),
				// i === 3 && debug('_result 4', _result),
				cond(greaterOrEq(_result, _limitTrans), [
					set(_offset, sub(_offset, batchHeight)),
					set(_result, add(_originalPos, _offset))
				]),
				// call([_result], ([r]) => {
				//     _ui = produce(_ui, (draft) => {
				//         if (!draft[i]) {
				//             draft[i] = {
				//                 ui: 0,
				//                 data: 0
				//             };
				//         }
				//         draft[i].ui = r / heightRow;
				//     });
				// }),
				set(_diff, sub(_result, _tmpResult)),
				cond(
					and(not(resetting), greaterThan(abs(_diff), heightRow)),
					call([_diff], ([d]) => {
						_dic = produce(_dic, (draft) => {
							// <=
							if (Math.abs(d) < batchHeight) {
								_dicDelete.push(draft[i]);
							}
							const tmp =
								(draft[i] || i) + _.floor(d / heightRow);
							draft[i] = handleDuplicate(
								_.uniq([..._dicDelete, ..._.values(_dic)]),
								tmp,
								d > 0
							);

							// if (d < 0 && d > -batchHeight) {
							//     draft[i] = draft[i] - 1;
							// }
						});

						// _ui = produce(_ui, (draft) => {
						//     if (!draft[i]) {
						//         draft[i] = {
						//             ui: 0,
						//             data: 0
						//         };
						//     }
						//     draft[i].ui = r / heightRow;
						//     draft[i].data = _dic[i];
						// });

						const debounce = _.debounce(() => {
							onChange(_dic);
						}, 50);
						debounce();
					})
				),
				set(_tmpResult, _result),
				_result
			],
			add(_originalPos, _offset)
		);
	};

	const _deleteStatus = new Value(-1);

	const items = [];
	for (let i = 0; i < NUMBER_LIST; i++) {
		items[i] = new Value(0);
	}

	const deleteBlocks = createDeleteBlock(
		heightRow,
		finished,
		_deleteTimer,
		_deleteStatus,
		items,
		_sizeData
	);

	const result = {};
	const dicForReset = [];

	for (let i = 0; i < NUMBER_LIST; i++) {
		const [_offset, deleteBlock, _tmpOffset] = deleteBlocks[i];
		const _tmpResult = new Value(i * heightRow);

		result[i] = block([
			...deleteBlock,
			set(items[i], handleItem(i, _offset, finished, _tmpResult)),
			items[i]
		]);
		dicForReset[i] = [_offset, items[i], _tmpOffset, _tmpResult];
	}

	const onDelete = (index, cb) => {
		_deleteStatus.setValue(index);
		cb && cb();
	};
	let timer = null;
	let timer1 = null;
	const onReset = () => {
		resetting.setValue(1);
		timer1 && clearTimeout(timer1);
		timer1 = setTimeout(() => {
			timer1 = null;
			_dic = createnewDic();
			_dicDelete = [];
			for (let i = 0; i < NUMBER_LIST; i++) {
				const [_offset, item, _tmpOffset, _tmpResult] = dicForReset[i];
				_offset.setValue(0);
				_tmpOffset.setValue(0);
				_tmpResult.setValue(i * heightRow);
				item.setValue(i * heightRow);
			}
			onChange({});
			timer && clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				resetting.setValue(0);
			}, 100);
		}, 100);
	};

	return [result, onDelete, onReset];
};

let HandleDataWithScroll = (
	{
		_scrollValue,
		setData,
		setSize,
		heightRow = HEIGHT_EARCH_ROW,
		setLoading
	},
	ref
) => {
	const timer = useRef();
	const timer1 = useRef();
	const [itemDataIndexs, onChange] = useState({}); // as index of data
	const [_sizeData] = useState(() => new Value(NUMBER_LIST));
	const [_deleteTimer, finished, deleteTimerBlock] = createTiming(
		0,
		heightRow,
		100
	);

	const [marketData, isLoading] = useData();
	const [mapMarketData, resetMapData] = useMapData();
	const sizeData = _.size(marketData);
	const dispatch = useDispatch();

	useEffect(() => {
		const debounce = _.debounce(
			() => dispatch.subWatchlist.resetActions(),
			100
		);
		debounce();
	}, [sizeData, dispatch]);

	useEffect(() => {
		_sizeData.setValue(Math.max(NUMBER_LIST, sizeData));
		setSize(sizeData);
		setLoading(isLoading);
	}, [sizeData, isLoading]);

	const [[_arrTrans, onDelete, onReset]] = useState(() =>
		createMoveAnimater({
			_deleteTimer,
			_sizeData,
			_scrollValue,
			finished,
			heightRow,
			onChange
		})
	);

	useEffect(() => {
		setData(_.map(_arrTrans, (_trans) => ({ _trans }))); // had NUMBER_LIST item)
	}, []);

	useImperativeHandle(ref, () => ({
		onDelete,
		reset: () => {
			timer.current && clearTimeout(timer.current);
			timer.current = setTimeout(() => {
				resetMapData && resetMapData();
				timer1.current && clearTimeout(timer1.current);
				timer1.current = setTimeout(() => {
					onReset && onReset();
				}, 100);
			}, 100);
		}
	}));

	useEffect(() => {
		setData((p) =>
			produce(p, (draft) => {
				_.forEach(draft, (item, index) => {
					const key = mapMarketData[itemDataIndexs[index] || index];
					const data = marketData[key] || {};
					draft[index].marketData = data;
				});
			})
		);
	}, [itemDataIndexs, marketData, mapMarketData, setData]);

	return <Animated.Code exec={deleteTimerBlock} />;
};

HandleDataWithScroll = forwardRef(HandleDataWithScroll);
HandleDataWithScroll = React.memo(HandleDataWithScroll);

export default HandleDataWithScroll;
