import React, { Component } from 'react';
import Animated, { Easing } from 'react-native-reanimated';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import _ from 'lodash';

import animatorActions from './reducer';
import * as ANIMATION_DEFINITIONS from './definitions';

const {
    and,
    Clock,
    Value,
    block,
    call,
    clockRunning,
    cond,
    greaterOrEq,
    interpolate,
    set,
    startClock,
    stopClock,
    timing,
    eq
} = Animated;

export const TRANSFORM_STYLE_PROPERTIES = [
    'perspective',
    'rotate',
    'rotateX',
    'rotateY',
    'rotateZ',
    'scale',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'translateX',
    'translateY'
];

class AnimatorComponent extends Component {
    constructor(props) {
        super(props);
        this._value = new Value(props.initValue || 0);
        this._clock = new Clock();
        this._key = props.keyAnimator || uuid.v4();
        this.state = {
            styles: {}
        };
        this.state.styles = this.changeStyles(this._value, props.animation);
    }

    componentDidMount() {
        if (this.props.startAtFirst) {
            this.startAnimation();
        }
    }

    setStartState = this.setStartState.bind(this);
    setStartState() {
        set(this._value, 0);
        startClock(this._clock);
    }

    setEndState = this.setEndState.bind(this);
    setEndState() {
        this._value.setValue(1);
    }

    timing(withOutOnEnd) {
        const state = {
            finished: new Value(0),
            position: this._value,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: ANIMATION_DEFINITIONS.DURATION,
            toValue: new Value(1),
            easing: Easing.linear
        };

        const callBack = withOutOnEnd ? () => null : this.props.onEnd;
        const track = new Value(0);

        return block([
            cond(
                clockRunning(this._clock),
                [
                    // if the clock is already running we update the toValue, in case a new dest has been passed in
                    set(config.toValue, 1)
                ],
                [
                    // if the clock isn't running we reset all the animation params and start the clock
                    set(state.finished, 0),
                    set(state.time, 0),
                    set(state.position, 0),
                    set(state.frameTime, 0),
                    set(config.toValue, 1),
                    startClock(this._clock)
                ]
            ),
            // we run the step here that is going to update position
            timing(this._clock, state, config),
            cond(
                and(
                    greaterOrEq(state.frameTime, config.duration / 5),
                    eq(track, 0)
                ),
                set(track, 1)
            ),
            cond(eq(track, 1), block([call([], callBack), set(track, 2)])),
            // if the animation is over we stop the clock
            cond(state.finished, stopClock(this._clock)),
            // we made the block return the updated position
            state.position
        ]);
    }

    getStyleConfig({ from, to }) {
        if (!from || !to) return;
        const obj = {};
        _.forEach(from, (value, key) => {
            obj[key] = {
                from: value,
                to: to[key]
            };
        });

        return obj;
    }

    changeStyles(node, curType) {
        const config = ANIMATION_DEFINITIONS[curType];
        const styleConfig = this.getStyleConfig(config);
        const styles = {};
        _.forEach(styleConfig, (value, key) => {
            const mapState = interpolate(node, {
                inputRange: [0, 1],
                outputRange: [value.from, value.to]
            });
            if (TRANSFORM_STYLE_PROPERTIES.indexOf(key) !== -1) {
                if (!styles.transform) {
                    styles.transform = [];
                }
                styles.transform.push({
                    [key]: mapState
                });
            } else {
                styles[key] = mapState;
            }
        });

        return styles;
    }

    startAnimation = this.startAnimation.bind(this);
    startAnimation(type, withOutOnEnd) {
        const { animation: typeAni } = this.props;
        const curType = type || typeAni;
        const node = this.timing(withOutOnEnd);
        this._node = node;
        const styles = this.changeStyles(node, curType);
        this.setState({ styles });

        // this.animate = this.timing(this._value, { toValue: new Animated.Value(1), duration, easing })
    }

    stopAnimation = this.stopAnimation.bind(this);
    stopAnimation() {
        if (this.animate) {
            this.animate.stop();
            this.animate = null;
        }
    }

    render() {
        return (
            <Animated.View
                {...this.props}
                style={[this.props.style, this.state.styles]}
            />
        );
    }
}

AnimatorComponent.defaultProps = {
    isDisappear: false,
    style: {},
    initY: 100,
    initX: 100,
    duration: 500,
    animation: 'fadeIn',
    onEnd: () => null,
    easing: Easing.linear,
    initValue: 0
};

export default AnimatorComponent;
