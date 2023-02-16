import React, { useMemo, useImperativeHandle, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import Animated, { Easing } from 'react-native-reanimated';

const { Value, multiply, min, sub, divide, concat } = Animated;

const SIZE = 64;
const SIDE = {
	BUY: 'buy',
	SELL: 'sell'
};

const Circle = ({ size, color }) => (
	<View
		style={{
			width: size,
			height: size,
			borderRadius: size / 2,
			backgroundColor: color,
			position: 'absolute'
		}}
	/>
);

const Rect = ({ children, isRight, rotate = 0, diameter, isAnimated }) => {
	const WrapperComp = isAnimated ? Animated.View : View;
	const rotateAnim = isAnimated ? concat(rotate, 'deg') : '0deg';
	return (
		<WrapperComp
			style={{
				position: 'absolute',
				width: diameter / 2,
				height: diameter,
				overflow: 'hidden',
				alignItems: !isRight ? undefined : 'flex-end',
				right: isRight ? undefined : 0,
				left: !isRight ? undefined : 0,
				transform: [
					{ translateX: isRight ? -diameter / 4 : diameter / 4 },
					{ rotate: rotateAnim },
					{ translateX: isRight ? diameter / 4 : -diameter / 4 }
				]
			}}
		>
			{children}
		</WrapperComp>
	);
};

let OrdersRowPieChart = (
	{
		diameter = SIZE,
		side = SIDE.BUY,
		totalColor = CommonStyle.fontNearLight7,
		holeColor = CommonStyle.color.dark,
		TextComp
	},
	ref
) => {
	const percentValue = useMemo(() => {
		return new Value(0);
	}, []);
	const rightValueAnim = useMemo(() => {
		return multiply(
			sub(180, multiply(divide(min(percentValue, 50), 50), 180)),
			-1
		);
	}, []);
	const leftValueAnim = useMemo(() => {
		return multiply(
			multiply(divide(min(sub(100, percentValue), 50), 50), 180),
			-1
		);
	}, []);
	const progressColor =
		side === SIDE.BUY ? CommonStyle.color.buy : CommonStyle.color.sell;
	const changePercent = useCallback((percent) => {
		percentValue.setValue(percent || 0);
	}, []);
	useImperativeHandle(ref, () => {
		return {
			changePercent
		};
	});
	return (
		<View
			style={{
				position: 'absolute',
				top: 4,
				bottom: 4,
				right: 0,
				width: diameter,
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: diameter / 2,
				backgroundColor: CommonStyle.color.dark
			}}
		>
			<View style={{ alignItems: 'center', justifyContent: 'center' }}>
				<Circle size={diameter} color={totalColor} />
				<Rect diameter={diameter}>
					<Rect rotate={leftValueAnim} diameter={diameter} isAnimated>
						<Circle size={diameter} color={progressColor} />
					</Rect>
				</Rect>

				<Rect isRight isParent diameter={diameter}>
					<Rect
						isRight
						rotate={rightValueAnim}
						diameter={diameter}
						isAnimated
					>
						<Circle size={diameter} color={progressColor} />
					</Rect>
				</Rect>

				<Circle size={diameter - 8} color={holeColor} />
				{TextComp}
			</View>
		</View>
	);
};

OrdersRowPieChart = React.forwardRef(OrdersRowPieChart);
OrdersRowPieChart = React.memo(OrdersRowPieChart, (prevProps, nextProps) => {
	const { side: prevSide } = prevProps;
	const { side } = nextProps;
	return side === prevSide;
});

export default OrdersRowPieChart;
const styles = StyleSheet.create({});
