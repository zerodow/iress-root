import React, {
	useCallback,
	useRef,
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle
} from 'react';
import {
	View,
	Dimensions,
	Image,
	StyleSheet,
	TouchableOpacity
} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import { HEIGHT_ROW } from './tradeList.row';
import { createPanEvent, GESTURE_AXIS } from './tradelist.hook';
import { useInteracble } from './tradelist.interacble';
import { getSnapPoint, ACTIONS_WIDTH } from './tradelist.func';
import Timing from '~s/watchlist/Animator/Timing';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

export const DELETE_WIDTH = 68;

const img = {
	delete: require('~/img/delete.png'),
	searchSymbol: require('~/img/searchSymbol.png'),
	newOrder: require('~/img/newOrder.png'),
	newAlert: require('~/img/newAlert.png')
};

export const Icon = ({ disabled, onPress, style, stylesIcon, name }) => {
	const isDisabled = !onPress || disabled;
	const IconSelf = CommonStyle.icons[name]

	if (isDisabled) {
		return (
			<View style={[styles.item, style]}>
				<IconSelf style={[styles.iconDisable, stylesIcon, { tintColor: '#000000' }]} />
			</View>
		);
	}

	return (
		<TouchableOpacity
			disabled={!onPress || disabled}
			onPress={onPress}
			style={[styles.item, style]}
		>
			<IconSelf style={[styles.icon, stylesIcon, { tintColor: '#000000' }]} />
		</TouchableOpacity>
	);
};

let LeftContent = ({ _trans, onAddToWl, onOpenNewOrder }) => {
	return (
		<Animated.View
			style={[
				styles.container,
				{
					minWidth: ACTIONS_WIDTH + 8,
					height: HEIGHT_ROW - 3,
					width: Animated.add(16, _trans),
					opacity: Animated.cond(Animated.lessThan(_trans, -10), 0, 1)
				}
			]}
		>
			<Icon name="searchSymbol" onPress={onAddToWl} />
			<View style={styles.horizontalLine} />
			<Icon onPress={onOpenNewOrder} name="newOrder" />
			<View style={styles.horizontalLine} />
			<Icon name="newAlert" />
		</Animated.View>
	);
};

// LeftContent = React.memo(LeftContent);

let RightContent = ({ _trans, isIress, onDelete }) => {
	if (isIress) return null;
	return (
		<Animated.View
			style={[
				styles.container2,
				{
					minWidth: DELETE_WIDTH + 16,
					height: HEIGHT_ROW - 3,
					width: Animated.sub(16, _trans),
					opacity: Animated.cond(
						Animated.greaterThan(_trans, 10),
						0,
						1
					)
				}
			]}
		>
			<Icon
				name="delete"
				stylesIcon={{ transform: [{ rotate: '337.5deg' }] }}
				onPress={onDelete}
			/>
		</Animated.View>
	);
};

RightContent = React.memo(RightContent);

let Interactable = ({ isIress, _trans, children, _reset, onSnap }, ref) => {
	const [[onGestureEvent, { _gesture, _pos, _state }]] = useState(() =>
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
			<Animated.View
				style={{ transform: [{ translateX }] }}
			// pointerEvents="box-only"
			>
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
		onChangeFavourites,
		onDeleteItem,
		onOpenNewOrder,
		isIress,
		isInFavorites,
		children
	},
	ref
) => {
	const _interact = useRef();
	const _timer = useRef();
	const [_transY] = useState(() => new Animated.Value(0));
	const [_pos] = useState(() => new Animated.Value(0));

	useImperativeHandle(ref, () => ({
		snapTo: (...p) => _interact.current && _interact.current.snapTo && _interact.current.snapTo(...p)
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
				isInFavorites={isInFavorites}
				onAddToWl={onAddToWl}
				onOpenNewOrder={onOpenNewOrder}
				onChangeFavourites={onChangeFavourites}
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
	container2: {
		position: 'absolute',
		right: 9,
		top: 1,
		paddingLeft: 16,
		borderRadius: 8,
		backgroundColor: CommonStyle.color.sell
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		// justifyContent: 'space-around',
		flex: 1
	},
	horizontalLine: {
		height: '100%',
		borderRightWidth: 1,
		borderColor: CommonStyle.color.dusk
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%'
	},
	icon: {
		width: 22,
		height: 22
	},
	iconDisable: {
		width: 22,
		height: 22,
		opacity: 0.5
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
