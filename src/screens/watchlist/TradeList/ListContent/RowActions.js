import React, {
	useCallback,
	useRef,
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle
} from 'react';
import { Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

import { useInteracble } from '~s/watchlist/TradeList/tradelist.interacble';
import {
	GESTURE_AXIS,
	createPanEvent
} from '~s/watchlist/TradeList/tradelist.hook';
import { getSnapPoint } from '~s/watchlist/TradeList/tradelist.func';

import Timing from '~s/watchlist/Animator/Timing';
import { LeftContent, RightContent } from './Components';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

export const DELETE_WIDTH = 68;

let Interactable = ({ _trans, _reset, isIress, children, onSnap }, ref) => {
	const [[onGestureEvent, { _gesture, _state }]] = useState(() =>
		createPanEvent(GESTURE_AXIS.X_AXIS)
	);
	const [[translateX, snapTo], setTrans] = useState([0, () => { }]);

	useEffect(() => {
		const snapPoints = getSnapPoint(isIress);
		setTrans(
			useInteracble(_gesture, _state, _reset, 'x', 'vx', {
				snapPoints,
				animatedValueX: _trans,
				onSnap: ({ nativeEvent: { index } }) => onSnap && onSnap(index)
			})
		);
	}, [isIress]);

	useImperativeHandle(ref, () => ({
		snapTo
	}));

	return (
		<PanGestureHandler
			maxPointers={1}
			activeOffsetX={[-15, 15]}
			onGestureEvent={onGestureEvent}
			onHandlerStateChange={onGestureEvent}
		>
			<Animated.View style={{ transform: [{ translateX }] }}>
				{children}
			</Animated.View>
		</PanGestureHandler>
	);
};

Interactable = forwardRef(Interactable);

let TradeListActions = (
	{
		_trans,
		onSnap,
		onAddToWl,
		onDeleteItem,
		onOpenNewOrder,
		isIress,
		children,
		onCreateAler
	},
	ref
) => {
	const _interact = useRef();
	const _timer = useRef();
	const [_transY] = useState(() => new Animated.Value(0));
	const [_pos] = useState(() => new Animated.Value(0));

	useImperativeHandle(ref, () => ({
		snapTo: (...p) =>
			_interact.current &&
			_interact.current.snapTo &&
			_interact.current.snapTo(...p)
	}));

	const onDelete = useCallback(() => {
		_timer.current && _timer.current.start();
	});

	const onEnd = useCallback(() => {
		onDeleteItem && onDeleteItem();
		setTimeout(() => {
			_timer.current && _timer.current.reset();
		}, 200);
	}, [onDeleteItem]);

	return (
		<Animated.View
			style={{
				transform: [{ translateX: _pos }]
			}}
		>
			<Timing
				_pos={_pos}
				duration={100}
				toValue={-DEVICE_WIDTH * 1.3}
				ref={_timer}
				autoStart={false}
				onEnd={onEnd}
			/>

			<LeftContent
				_trans={_transY}
				onAddToWl={onAddToWl}
				onOpenNewOrder={onOpenNewOrder}
				onCreateAler={onCreateAler}
			/>
			<RightContent
				_trans={_transY}
				isIress={isIress}
				onDelete={onDelete}
			/>
			<Interactable
				ref={_interact}
				isIress={isIress}
				_reset={_trans}
				_trans={_transY}
				onSnap={onSnap}
			>
				{children}
			</Interactable>
		</Animated.View>
	);
};

TradeListActions = forwardRef(TradeListActions);
TradeListActions = React.memo(TradeListActions);

export default TradeListActions;
