import React, { useImperativeHandle, useRef, forwardRef } from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import Animated from 'react-native-reanimated';

const ScrollView = Animated.createAnimatedComponent(RNScrollView);

const { event } = Animated;

const AnimatedScroll = (props, ref) => {
	const _scroll = useRef();

	useImperativeHandle(ref, () => ({
		reset: () =>
			_scroll.current &&
			_scroll.current.getNode &&
			_scroll.current.getNode().scrollTo({ y: 0, animated: false })
	}));

	return (
		<ScrollView
			{...props}
			ref={_scroll}
			onRefresh={undefined}
			removeClippedSubviews={false}
			scrollEventThrottle={1}
			showsVerticalScrollIndicator={false}
			scrollEventThrottle={2}
			onScroll={event([
				{
					nativeEvent: {
						contentOffset: {
							y: props._scrollValue
						}
					}
				}
			])}
		/>
	);
};

export default forwardRef(AnimatedScroll);
