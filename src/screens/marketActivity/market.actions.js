import React, {
	useState,
	forwardRef,
	useRef,
	useImperativeHandle,
	useCallback
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PanGestureHandler } from 'react-native-gesture-handler';

import {
	createPanEvent,
	GESTURE_AXIS
} from '~s/watchlist/TradeList/tradelist.hook';
import { useInteracble } from '~s/watchlist/TradeList/tradelist.interacble';
import { Icon } from '~s/watchlist/TradeList/tradelist.actions';
import {
	getSnapPoint,
	ACTIONS_WIDTH
} from '~s/watchlist/TradeList/tradelist.func';
import { HEIGHT_ROW_MARKET_INFO } from '~s/watchlist/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

export let LeftContent = ({ _trans, onAddToWl, onOpenNewOrder, onNewAlertLog }) => {
	return (
		<Animated.View
			style={[
				styles.container,
				{
					minWidth: ACTIONS_WIDTH + 8,
					height: HEIGHT_ROW_MARKET_INFO - 3,
					width: Animated.add(16, _trans),
					opacity: Animated.cond(Animated.lessThan(_trans, -10), 0, 1)
				}
			]}
		>
			<Icon name="searchSymbol" onPress={onAddToWl} />
			<View style={styles.horizontalLine} />
			<Icon onPress={onOpenNewOrder} name="newOrder" />
			<View style={styles.horizontalLine} />
			<Icon onPress={onNewAlertLog} name="newAlert" />
		</Animated.View>
	);
};

// LeftContent = React.memo(LeftContent);
let Interactable = ({ children, _trans, _reset, onSnap }, ref) => {
	// const [_trans] = useState(() => new Animated.Value(0));
	const [[onGestureEvent, { _gesture, _pos, _state }]] = useState(() =>
		createPanEvent(GESTURE_AXIS.X_AXIS)
	);

	const [[translateX, snapTo]] = useState(() =>
		useInteracble(_gesture, _state, _reset, 'x', 'vx', {
			snapPoints: getSnapPoint(true),
			animatedValueX: _trans,
			onSnap: ({ nativeEvent: { index } }) => onSnap && onSnap(index)
		})
	);

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

let MarketActions = (
	{ children, onSnap, onOpenNewOrder, showAddToWl, onNewAlertLog },
	ref
) => {
	const _interact = useRef();
	const [_transY] = useState(() => new Animated.Value(0));

	useImperativeHandle(ref, () => ({
		snapTo: (...p) => _interact.current && _interact.current.snapTo(...p)
	}));

	const curOnSnap = useCallback((i) => {
		onSnap &&
			onSnap(
				i,
				(...p) => _interact.current && _interact.current.snapTo(...p)
			);
	}, []);

	return (
		<React.Fragment>
			<LeftContent
				_trans={_transY}
				onOpenNewOrder={onOpenNewOrder}
				onAddToWl={showAddToWl}
				onNewAlertLog={onNewAlertLog}
			/>

			<Interactable ref={_interact} _trans={_transY} onSnap={curOnSnap}>
				{children}
			</Interactable>
		</React.Fragment>
	);
};

MarketActions = forwardRef(MarketActions);
MarketActions = React.memo(MarketActions);
export default MarketActions;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

	container: {
		position: 'absolute',
		left: 9,
		top: 1,
		paddingRight: 16,
		borderRadius: 8,
		backgroundColor: CommonStyle.color.turquoiseBlue,
		justifyContent: 'center',
		flexDirection: 'row'
	},
	horizontalLine: {
		height: '100%',
		borderRightWidth: 1,
		borderColor: CommonStyle.color.dusk_tabbar
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
