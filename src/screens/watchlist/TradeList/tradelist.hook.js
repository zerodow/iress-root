import { useCallback, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'react-fast-compare';

import Animated, { Easing } from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';
import produce from 'immer';
import { debounce } from 'lodash';

import { useVelocity, useBatch } from '~/component/lazyListView/BlockAnimated';
import {
	HEIGHT_SEPERATOR,
	STATE,
	HEIGHT_ROW,
	NUMBER_LIST,
	DEVICE_HEIGHT
} from '~s/watchlist/enum';

import Enum from '~/enum';
import { dataStorage } from '~/storage';
import { getKey, onChangeData } from './tradelist.func';
import { getLastTimeRenewToken } from '~/lib/base/functionUtil';

const {
	add,
	cond,
	divide,
	eq,
	event,
	block,
	set,
	startClock,
	stopClock,
	Clock,
	Value,
	debug,
	floor,
	neq,
	spring,
	timing,
	call,
	lessThan,
	greaterThan,
	multiply,
	sub,
	max,
	min,
	diff
} = Animated;

export const useScroll = () => {
	const [_scrollValue] = useState(() => new Value(0));
	const [firstIndex, setFirstIndex] = useState(0);
	const [lastIndex, setLastIndex] = useState(0);

	const [onScroll] = useState(() =>
		event([
			{
				nativeEvent: { contentOffset: { y: _scrollValue } }
			}
		])
	);

	const [_velocity, velocityBlock] = useVelocity(_scrollValue);
	const [_firstIndex, _lastIndex, batchBlock] = useBatch({
		_scrollValue,
		_heightRow: HEIGHT_ROW + HEIGHT_SEPERATOR,
		_velocity,
		// onChange: () => null
		onChange: ([f, l]) => {
			setFirstIndex(f);
			setLastIndex(l);
		}
	});

	return [onScroll, firstIndex, lastIndex, velocityBlock, batchBlock];
};
export const useResponder = () => {
	const _gestureState = new Value(STATE.ON_MOMENTUM_END);

	const onMomentumScrollBegin = () =>
		_gestureState.setValue(STATE.ON_MOMENTUM);

	const onMomentumScrollEnd = () =>
		_gestureState.setValue(STATE.ON_MOMENTUM_END);
	const onResponderGrant = () => _gestureState.setValue(STATE.ON_START);

	const onResponderReject = () => _gestureState.setValue(STATE.ON_END);

	const onResponderRelease = () => _gestureState.setValue(STATE.ON_END);

	return {
		_gestureState,
		responder: {
			onMomentumScrollBegin,
			onMomentumScrollEnd,
			onResponderGrant,
			onResponderReject,
			onResponderRelease
		}
	};
};

export const GESTURE_AXIS = {
	ALL: 'ALL',
	X_AXIS: 'X_AXIS',
	Y_AXIS: 'Y_AXIS'
};

export const createPanEvent = (status) => {
	const nativeEvent = {};
	const _state = new Value(State.UNDETERMINED);

	let _gesture = new Value(0);
	let _velocity = new Value(0);
	let _pos = new Value(0);

	if (status === GESTURE_AXIS.X_AXIS) {
		nativeEvent.translationX = _gesture;
		nativeEvent.velocityX = _velocity;
		nativeEvent.x = _pos;
	} else if (status === GESTURE_AXIS.Y_AXIS) {
		nativeEvent.translationY = _gesture;
		nativeEvent.velocityY = _velocity;
		nativeEvent.y = _pos;
	} else {
		_gesture = {
			x: new Value(0),
			y: new Value(0)
		};

		_velocity = {
			x: new Value(0),
			y: new Value(0)
		};

		_pos = {
			x: new Value(0),
			y: new Value(0)
		};

		nativeEvent.translationX = _gesture.x;
		nativeEvent.translationY = _gesture.y;
		nativeEvent.velocityX = _velocity.x;
		nativeEvent.velocityY = _velocity.y;
		nativeEvent.x = _pos.x;
		nativeEvent.y = _pos.y;
	}

	nativeEvent.state = _state;

	const onGestureEvent = event([{ nativeEvent }]);

	return [onGestureEvent, { _gesture, _velocity, _state, _pos }];
};

export const useGetIndex = (_pos, _state) => {
	const _finished = new Value(1);
	const _transIndex = new Value(0);
	const _oldTransIndex = new Value(0);

	return [
		block([
			cond(
				eq(_state, State.ACTIVE),
				[
					cond(_finished, [
						set(_oldTransIndex, _transIndex),
						set(
							_transIndex,
							floor(
								divide(_pos, add(HEIGHT_ROW, HEIGHT_SEPERATOR))
							)
						),
						set(_finished, 0)
					])
				],
				[set(_finished, 1)]
			),
			_transIndex
		]),
		_oldTransIndex
	];
};

export const useOldTrans = (_translate, _transIndex) => {
	const clock = new Clock();

	const state = {
		finished: new Value(0),
		position: new Value(0),
		time: new Value(0),
		velocity: new Value(0)
	};

	const config = {
		stiffness: new Value(300),
		mass: new Value(1),
		damping: new Value(30),
		overshootClamping: false,
		restSpeedThreshold: 0.001,
		restDisplacementThreshold: 0.001,
		toValue: new Value(0)
	};

	const _oldIndex = new Value(0);
	const _oldTrans = new Value(0);

	return block([
		cond(
			neq(_oldIndex, _transIndex),
			[set(_oldIndex, _transIndex), set(state.position, _oldTrans)],
			set(_oldTrans, _translate)
		),

		cond(state.finished, stopClock(clock), startClock(clock)),
		spring(clock, state, config),
		state.position
	]);
};

export const useNavigator = (navigator, arrCallback, deps) => {
	const onNavigatorEvent = useCallback((event) => {
		_.forEach(arrCallback, (cb, key) => {
			if (event.id === key) {
				cb && cb();
			}
		});
	}, deps || []);

	useEffect(() => {
		const listener = navigator.addOnNavigatorEvent(onNavigatorEvent);
		return () => listener();
	}, [navigator]);
};

export const useNavigatorCallback = (navigator, callback, deps) => {
	const onNavigatorEvent = useCallback((event) => {
		callback && callback(event);
	}, deps || []);

	useEffect(() => {
		const listener = navigator.addOnNavigatorEvent(onNavigatorEvent);
		return () => listener();
	}, [navigator]);
};

export const useRowEffect = () => {
	const [result, setResult] = useState([]);
	const [priceboardDetail, priceBoardSelected, isLoading] = useSelector(
		(state) => {
			const { priceBoard, priceBoardSelected, isLoadingState } =
				state.watchlist3;
			return [
				priceBoard[priceBoardSelected] || {},
				priceBoardSelected,
				isLoadingState
			];
		},
		isEqual
	);

	const favoritesDetail = useSelector((state) => {
		const { priceBoard } = state.watchlist3;
		return priceBoard[Enum.WATCHLIST.USER_WATCHLIST] || {};
	}, isEqual);

	const dispatch = useDispatch();

	const onChangeWL = useCallback(
		(symbol, exchange, isFavoritesButton, isDelete) => {
			// callback
			if (isFavoritesButton) {
				onChangeData(favoritesDetail, symbol, exchange, isDelete);
				dispatch.priceBoard.addOrRemoveSymbol({
					symbol,
					exchange,
					priceboardId: Enum.WATCHLIST.USER_WATCHLIST
				});
			} else {
				onChangeData(priceboardDetail, symbol, exchange, true);
				dispatch.priceBoard.addOrRemoveSymbol({
					symbol,
					exchange
				});
			}
		},
		[favoritesDetail, priceboardDetail]
	);

	const { value: listSymbol, isIress = false } = priceboardDetail || {};

	useEffect(() => {
		const { value } = favoritesDetail;
		const favorites = {};
		_.forEach(value, (item) => (favorites[getKey(item)] = true));

		const newValue = _.map(listSymbol, (item) => {
			const key = getKey(item);
			return {
				...item,
				isIress,
				isInFavorites: favorites[key] || false
			};
		});

		setResult(newValue);
	}, [listSymbol, isIress, favoritesDetail]);

	return [result, priceBoardSelected, isIress, isLoading, onChangeWL];
};

let appStateEvent = null;

export const useAppState = (
	activeCallback,
	inactiveCallback,
	ignoreCheckTokenExpire = false
) => {
	const appState = useRef(AppState.currentState);

	function onChange(newState) {
		if (dataStorage.tabIndexSelected !== 1) {
			return console.log('Not Watchlist Tab Active');
		}

		if (
			appState.current.match(/inactive|background/) &&
			newState === 'active'
		) {
			if (ignoreCheckTokenExpire) {
				activeCallback();
			} else {
				getLastTimeRenewToken(activeCallback);
			}
		}

		if (newState.match(/inactive|background/)) {
			inactiveCallback && inactiveCallback();
		}
		appState.current = newState;
	}

	const onChangeAsDebound = debounce(onChange, 500, { leading: false });

	useEffect(() => {
		const event = AppState.addEventListener('change', onChangeAsDebound);

		return () => {
			event && event.remove();
		};
	}, []);

	return {
		addListener: () => {
			appStateEvent = AppState.addEventListener('change', onChange);
		},
		removeListener: () => {
			appStateEvent && appStateEvent.remove();
		}
	};
};

export const useConnect = (callback) => {
	const isFirst = useRef(true);
	const isConnected = useSelector((state) => state.app.isConnected);
	useEffect(() => {
		if (isConnected && !isFirst.current) {
			callback && callback();
		}
	}, [isConnected]);

	useEffect(() => {
		isFirst.current = false;
	}, []);
};

export const useTiming = (fromValue, toValue, duration, cb) => {
	const createTimer = () => {
		const state = {
			finished: new Value(0),
			position: new Value(fromValue),
			time: new Value(0),
			frameTime: new Value(0)
		};

		const config = {
			duration: duration,
			toValue: new Value(toValue),
			easing: Easing.linear
		};

		const _clock = new Clock(0);
		const timer = block([
			cond(state.finished, [], startClock(_clock)),
			timing(_clock, state, config),
			cond(state.finished, [
				stopClock(_clock),
				cb && call([], () => cb())
			])
		]);

		return [state.position, state.finished, timer];
	};

	const [[_timer, finished, timerBlock]] = useState(() => createTimer());
	return [_timer, finished, timerBlock];
};

export const useListTrans = (_scrollValue) => {
	const heightRow = HEIGHT_ROW + HEIGHT_SEPERATOR + 8;
	const _dic = useRef({});
	const [dicIndex, setDicIndex] = useState({});
	const handeChange = (key, isUppper) => {
		_dic.current = produce(_dic.current, (draft) => {
			if (!draft[key]) {
				draft[key] = key; // key as index
			}
			draft[key] = isUppper
				? draft[key] + NUMBER_LIST
				: draft[key] - NUMBER_LIST;
		});

		setDicIndex(_dic.current);
	};

	const [_objTransY] = useState(() => {
		const result = {};

		for (let i = 0; i <= NUMBER_LIST; i++) {
			const trans = new Value(0);
			const diffValue = new Value(0);

			result[i] = block([
				cond(
					lessThan(add(trans, i * heightRow), add(_scrollValue, 150)),
					set(trans, add(trans, NUMBER_LIST * heightRow))
				),
				cond(
					greaterThan(
						add(trans, i * heightRow),
						add(_scrollValue, DEVICE_HEIGHT - 150)
					),
					set(trans, sub(trans, NUMBER_LIST * heightRow))
				),
				set(diffValue, diff(trans)),
				cond(
					greaterThan(diffValue, 0),
					call([], () => handeChange(i, true))
				),
				cond(
					lessThan(diffValue, 0),
					call([], () => handeChange(i, false))
				),
				trans
			]);
		}
		return result;
	});

	return [dicIndex, _objTransY];
};

export const awaitCallback = (getDK, cb) => {
	if (!getDK || !cb) return;
	if (getDK()) {
		cb();
	} else {
		const timer = setInterval(() => {
			if (getDK()) {
				cb();
				clearInterval(timer);
			}
		}, 300);
	}
};
