import React, { Component } from 'react'
import { Platform } from 'react-native'
import _ from 'lodash'
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated';
import AnimatedBezier from 'react-native-reanimated/src/core/AnimatedBezier'

const {
    add,
    cond,
    diff,
    divide,
    eq,
    event,
    min,
    lessThan,
    and,
    block,
    multiply,
    set,
    abs,
    clockRunning,
    greaterThan,
    startClock,
    stopClock,
    sub,
    Clock,
    Value,
    decay,
    timing,
    or,
    not,
    neq,
    call
} = Animated;

const P = (android, ios) => (Platform.OS === 'ios' ? ios : android);

const magic = {
    deceleration: 0.997,
    velocityFactor: P(1, 1.2)
};

const {
    deceleration,
    velocityFactor
} = magic;

const cancelValue = 5
export const swipeBounce = (t) => new AnimatedBezier(t, 0.25, 0.46, 0.45, 0.94);

export default class NestedScrollView extends Component {
    constructor(props) {
        super(props)
        this.snapPoint = []

        // handle layout
        this.heightContent = new Value(0)
        this.heightContainer = new Value(0)

        // handle pan vector
        // this.panVector = new Value(0)

        // handle Pan
        this.gesture = { x: new Value(0), y: new Value(0) };
        this.panState = new Value(-1);
        this.velocityY = new Value(0);

        // handle Tap
        this.tapState = new Value(0)
        this.handleTap = event([{ nativeEvent: { state: this.tapState } }]);

        this._onGestureEvent = event([
            {
                nativeEvent: {
                    translationX: this.gesture.x,
                    translationY: this.gesture.y,
                    velocityY: this.velocityY,
                    state: state => cond(
                        eq(state, State.CANCELLED),
                        set(this.panState, State.END),
                        set(this.panState, state)
                    )
                }
            }
        ]);

        // defind default value
        this.translateY = new Value(this.props.snapPoint[0] || 0)
        this.decayClock = new Clock()
        this.timingClock = new Clock()
        this.velocityClock = new Clock()
        this.stateDecay = {
            finished: new Value(0),
            velocity: new Value(0),
            position: new Value(0),
            time: new Value(0)
        };
        this.stateTiming = {
            finished: new Value(0),
            position: new Value(0),
            time: new Value(0),
            frameTime: new Value(0)
        };
        this.configTiming = {
            duration: new Value(5000),
            toValue: new Value(0),
            easing: swipeBounce
        };
    }

    withPreAdditiveOffset() {
        const prev = new Value(0)
        const offset = new Value(0)
        const newPos = new Value(0)

        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        return (
            cond(
                eq(this.panState, State.BEGAN),
                [
                    set(prev, this.gesture.y)
                ],
                [
                    cond(greaterThan(diff(this.velocityClock), 100), set(this.velocityY, 0)),

                    set(offset, sub(this.gesture.y, prev)),
                    set(newPos, add(this.translateY, offset)),
                    cond(
                        or(
                            greaterThan(newPos, minPos),
                            lessThan(newPos, maxPos)
                        ),
                        set(newPos, add(this.translateY, divide(offset, 3)))
                    ),
                    set(this.translateY, newPos),
                    set(prev, this.gesture.y)
                ]
            )
        )
    }
    withHandlePan() {
        return [
            cond(
                eq(this.panState, State.BEGAN),
                [
                    clockRunning(this.velocityClock),
                    stopClock(this.timingClock)
                ]
            ),
            cond(
                eq(this.panState, State.END),
                [
                    stopClock(this.velocityClock)
                ]
            )
        ]
    }

    startDecay() {
        const config = { deceleration };
        return (
            block([
                cond(
                    clockRunning(this.decayClock),
                    0,
                    [
                        cond(
                            this.wasStartedFromBegin,
                            0,
                            [
                                set(this.wasStartedFromBegin, 1),
                                set(this.stateDecay.finished, 0),
                                set(this.stateDecay.velocity, multiply(this.velocityY, velocityFactor)),
                                set(this.stateDecay.position, this.translateY),
                                set(this.stateDecay.time, 0),
                                startClock(this.decayClock)
                            ]
                        )
                    ]
                ),
                cond(clockRunning(this.decayClock), decay(this.decayClock, this.stateDecay, config)),
                cond(this.stateDecay.finished, [stopClock(this.decayClock)]),
                this.stateDecay.position
            ])
        )
    }

    cancelDecay() {
        return [
            stopClock(this.decayClock),
            cond(eq(this.panState, State.BEGAN), [
                set(this.wasStartedFromBegin, 0)
            ])
        ]
    }

    isGreateThanMinVelocity() {
        return greaterThan(
            abs(
                multiply(
                    this.velocityY,
                    velocityFactor
                )
            ),
            cancelValue
        )
    }

    isOutOfLimitPos() {
        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        const detal = new Value(0)

        return block([
            set(detal, 0),
            cond(greaterThan(this.translateY, minPos), set(detal, sub(this.translateY, minPos))),
            cond(lessThan(this.translateY, maxPos), set(detal, sub(maxPos, this.translateY))),
            lessThan(detal, 50)
        ])
    }

    withDecaying() {
        // since there might be moar than one clock
        this.wasStartedFromBegin = new Value(0);

        return cond(
            and(
                not(clockRunning(this.timingClock)),
                eq(this.panState, State.END),
                or(
                    eq(this.tapState, State.FAILED), // Thang ios tra ve FAILED
                    eq(this.tapState, State.CANCELLED) // Thang android tra ve Cancelled
                ),
                this.isGreateThanMinVelocity(),
                this.isOutOfLimitPos()
            ),
            set(
                this.translateY,
                this.startDecay()
            ),
            this.cancelDecay()
        )
    }

    onContainerLayout = this.onContainerLayout.bind(this)
    onContainerLayout({ nativeEvent: { layout: { height } } }) {
        this.heightContainer.setValue(height)
    }

    onLayoutContent = this.onLayoutContent.bind(this)
    onLayoutContent({ nativeEvent: { layout: { height } } }) {
        this.heightContent.setValue(height)
    }

    handleWrapPoint() {
        _.forEach(this.props.snapPoint, point => {
            if (typeof point === 'number') {
                this.snapPoint.push(new Value(point))
            } else if (_.indexOf(point, '%') !== -1) {
                const percent = _.replace(point, '%', '')
                const realHeight = multiply(
                    this.heightContent,
                    (+percent || 100) / 100,
                    -1
                )

                this.snapPoint.push(realHeight)
            }
        })
    }

    getScrollWithGestureState() {
        return and(
            neq(this.tapState, State.BEGAN),
            or(
                eq(this.panState, State.END),
                eq(this.tapState, State.END)
            ),
            not(clockRunning(this.decayClock))
        )
    }

    createTiming(value) {
        return cond(
            clockRunning(this.timingClock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(this.stateTiming.finished, 0),
                set(this.stateTiming.time, 0),
                set(this.stateTiming.position, this.translateY),
                set(this.stateTiming.frameTime, 0),
                set(this.configTiming.duration, min(multiply(abs(sub(this.translateY, value)), 3), 390)),
                set(this.configTiming.toValue, value),
                startClock(this.timingClock)
            ]
        )
    }

    snapTo(value) {
        return [
            this.createTiming(value),
            timing(this.timingClock, this.stateTiming, this.configTiming),
            cond(this.stateTiming.finished, stopClock(this.timingClock)),
            set(this.translateY, this.stateTiming.position)
        ]
    }

    withSnapBounce() {
        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        return cond(
            and(
                or(
                    // out of limit position
                    greaterThan(this.translateY, minPos),
                    lessThan(this.translateY, maxPos)
                ),
                // without decay
                not(clockRunning(this.decayClock)),

                // end drag
                eq(this.panState, State.END)
            ),
            [
                cond(greaterThan(this.translateY, minPos), this.snapTo(minPos)),
                cond(lessThan(this.translateY, maxPos), this.snapTo(maxPos))
            ]
        )
    }

    withOtherHandle() {
        return []
    }

    renderContent() {
        return (
            <Animated.View
                style={{ transform: [{ translateY: this.translateY }] }}>
                <PanGestureHandler
                    minDist={10}
                    enabled={this.props.dragEnabled}
                    onGestureEvent={this._onGestureEvent}
                    onHandlerStateChange={this._onGestureEvent}>
                    <Animated.View>
                        <TapGestureHandler
                            onHandlerStateChange={this.handleTap}
                        >
                            <Animated.View
                                style={{ minHeight: add(this.heightContainer, 20) }}
                                onLayout={this.onLayoutContent}>
                                {this.props.children}
                                <Animated.Code
                                    exec={block([
                                        this.withHandlePan(),
                                        this.withPreAdditiveOffset(),
                                        this.withDecaying(),
                                        this.withSnapBounce(),
                                        this.withOtherHandle()
                                    ])}
                                />
                            </Animated.View>
                        </TapGestureHandler>
                    </Animated.View>

                </PanGestureHandler>
            </Animated.View>
        )
    }

    render() {
        this.handleWrapPoint();

        return (
            <Animated.View
                pointerEvents="box-none"
                onLayout={this.onContainerLayout}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}
            >
                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        overflow: 'hidden',
                        position: 'absolute',
                        width: '100%'
                    }}
                >
                    {this.renderContent()}
                </Animated.View>
            </Animated.View>
        )
    }
}

NestedScrollView.defaultProps = {
    snapPoint: [0, '100%']
}
