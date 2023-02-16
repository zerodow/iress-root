import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import _ from 'lodash';

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
	timing,
	call,
	debug,
	clockRunning
} = Animated;

let Timing = (
	{ _pos, fromValue = 0, toValue = 0, duration = 300, onEnd, autoStart },
	ref
) => {
	const state = {
		finished: new Value(autoStart ? 0 : 1),
		position: _pos || new Value(fromValue),
		time: new Value(0),
		frameTime: new Value(0)
	};

	const config = {
		duration: duration,
		toValue: new Value(autoStart ? toValue : fromValue),
		easing: Easing.linear
	};

	const _clock = new Clock(0);
	const timer = block([
		cond(
			state.finished,
			cond(clockRunning(_clock), [
				stopClock(_clock),
				onEnd && call([], () => onEnd())
			]),
			startClock(_clock)
		),
		timing(_clock, state, config)
	]);

	useImperativeHandle(ref, () => ({
		start: ({ fromValue: f, toValue: t, duration: d } = {}) => {
			state.position.setValue(_.isNil(f) ? fromValue : f);
			state.time.setValue(0);
			state.frameTime.setValue(0);

			config.duration = _.isNil(d) ? duration : d;
			config.toValue.setValue(_.isNil(t) ? toValue : t);
			state.finished.setValue(0);
		},
		reverse: ({ fromValue: f, toValue: t, duration: d } = {}) => {
			state.finished.setValue(0);
			state.position.setValue(_.isNil(t) ? toValue : t);
			state.time.setValue(0);
			state.frameTime.setValue(0);

			config.duration = _.isNil(d) ? duration : d;
			config.toValue.setValue(_.isNil(f) ? fromValue : f);
		},
		reset: ({ fromValue: f, toValue: t, duration: d } = {}) => {
			state.position.setValue(_.isNil(f) ? fromValue : f);
			state.time.setValue(0);
			state.frameTime.setValue(0);

			config.duration = _.isNil(d) ? duration : d;
			config.toValue.setValue(_.isNil(t) ? toValue : t);
		},
		stop: () => {
			state.finished.setValue(1);
		}
	}));

	return <Animated.Code exec={timer} />;
};

Timing = forwardRef(Timing);
Timing = React.memo(Timing);

export const createTiming = (fromValue, toValue, duration, cb, autoStart) => {
	const state = {
		finished: new Value(autoStart ? 0 : 1),
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
		cond(
			state.finished,
			[stopClock(_clock), cb && call([], () => cb())],
			[
				cond(
					clockRunning(_clock),
					[],
					[
						set(state.position, fromValue),
						set(state.time, 0),
						set(state.frameTime, 0),
						set(config.toValue, toValue)
					]
				),
				startClock(_clock)
			]
		),
		timing(_clock, state, config)
	]);

	return [state.position, state.finished, timer];
};

export default Timing;

const styles = StyleSheet.create({});
