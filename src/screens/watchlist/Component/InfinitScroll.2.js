import React, { PureComponent } from 'react';
import {
    Platform,
    Dimensions,
    ScrollView as RNScrollView,
    View
} from 'react-native';
import _ from 'lodash';
import Animated, { Easing } from 'react-native-reanimated';
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';

import { WIDTH_ROW } from '../Header/header.row';

const ScrollView = Animated.createAnimatedComponent(RNScrollView);

const { width: deviceWidth } = Dimensions.get('window');

const {
    Clock,
    Value,
    abs,
    add,
    and,
    block,
    call,
    clockRunning,
    cond,
    decay,
    diff,
    divide,
    eq,
    event,
    greaterThan,
    lessThan,
    multiply,
    neq,
    not,
    or,
    set,
    startClock,
    stopClock,
    sub,
    timing
} = Animated;

const P = (android, ios) => (Platform.OS === 'ios' ? ios : android);

const magic = {
    damping: P(9, 7),
    mass: 0.3,
    stiffness: 121.6,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
    deceleration: 0.997,
    bouncyFactor: 1,
    velocityFactor: P(1, 1.2),
    dampingForMaster: 50,
    tossForMaster: 0.4,
    coefForTranslatingVelocities: 5
};

const { deceleration, velocityFactor } = magic;

const SCROLL_STATE = {
    UNDETERMINED: 0,
    ON_TOP: 1,
    ON_END: 2,
    ON_SCROLL: 3
};

const AUTO_STATE = {
    UNDETERMINED: 0,
    START: 1,
    STOP: 2
};

export default class InfinitScroll extends PureComponent {
    constructor(props) {
        super(props);
        this.valWithPreservedOffset = new Value(0);

        // handle Tap
        this.tapState = new Value(State.UNDETERMINED);
        this.handleTap = event([{ nativeEvent: { state: this.tapState } }]);

        // handle content Layout
        this.widthContent = new Value(0);
        this.heightContent = this.props._heightContent || new Value(0);
        this.onContentLayout = ({
            nativeEvent: {
                layout: { width, height }
            }
        }) => {
            this.widthContent.setValue(width);
            this.heightContent.setValue(height);
        };

        // handle Pan
        this.gesture = { x: new Value(0), y: new Value(0) };
        this.panState = new Value(State.UNDETERMINED);
        this.velocityX = new Value(0);
        this._onGestureEvent = event([
            {
                nativeEvent: {
                    translationX: this.gesture.x,
                    translationY: this.gesture.y,
                    velocityX: this.velocityX,
                    state: this.panState
                }
            }
        ]);

        // defind default value
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
            easing: Easing.linear
        };

        this.prevent = new Value(0);
        this.decayClock = new Clock();
        this.timingClock = new Clock();
        this.endItem = {
            x: new Value(0),
            width: new Value(0)
        };
        this.scrollState = new Value(SCROLL_STATE.UNDETERMINED);

        this.translateX = new Value(0);

        this.scrollAtFirst = new Value(1);

        this.autoState = new Value(AUTO_STATE.UNDETERMINED);
        this.resetState = new Value(0);

        this.state = {
            startIndex: 0
        };

        this.data = this.wrapData();
    }

    componentWillReceiveProps(nextProps) {
        this.data = this.wrapData(nextProps);
    }

    createTiming() {
        return cond(
            clockRunning(this.timingClock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(this.stateTiming.finished, 0),
                set(this.stateTiming.time, 0),
                set(this.stateTiming.position, this.translateX),
                set(this.stateTiming.frameTime, 0),
                set(
                    this.configTiming.duration,
                    multiply(
                        divide(
                            sub(
                                deviceWidth,
                                this.widthContent,
                                this.stateTiming.position
                            ),
                            -100
                        ),
                        this.props.speed
                    )
                ),
                set(
                    this.configTiming.toValue,
                    sub(deviceWidth, this.widthContent)
                ),
                startClock(this.timingClock)
            ]
        );
    }

    getScrollAtFirstState() {
        return and(
            eq(this.panState, State.UNDETERMINED),
            eq(this.tapState, State.UNDETERMINED),
            eq(this.autoState, AUTO_STATE.START)
        );
    }

    getScrollWithGestureState() {
        return and(
            neq(this.tapState, State.BEGAN),
            or(eq(this.panState, State.END), eq(this.tapState, State.END)),
            not(clockRunning(this.decayClock))
        );
    }

    withAutoScroll() {
        return [
            cond(
                or(
                    this.getScrollWithGestureState(),
                    this.getScrollAtFirstState()
                ),
                [
                    this.createTiming(),
                    // we run the step here that is going to update position
                    timing(
                        this.timingClock,
                        this.stateTiming,
                        this.configTiming
                    ),
                    // if the animation is over we stop the clock
                    cond(
                        this.stateTiming.finished,
                        stopClock(this.timingClock)
                    ),
                    set(this.translateX, this.stateTiming.position)
                ]
            )
        ];
    }

    withPreAdditiveOffset() {
        const prev = new Value(0);

        const offset = new Value(0);

        return cond(
            eq(this.panState, State.BEGAN),
            [set(prev, this.gesture.x)],
            [
                set(offset, sub(this.gesture.x, prev)),
                set(this.translateX, add(this.translateX, offset)),
                set(prev, this.gesture.x)
            ]
        );
    }

    withDecaying() {
        // since there might be moar than one clock
        const wasStartedFromBegin = new Value(0);

        const config = { deceleration };

        return cond(
            and(
                not(clockRunning(this.timingClock)),
                greaterThan(abs(multiply(this.velocityX, velocityFactor)), 5),
                eq(this.panState, State.END),
                or(
                    eq(this.tapState, State.FAILED),
                    eq(this.tapState, State.CANCELLED)
                )
                // not(eq(this.tapState, State.BEGAN))
            ),
            [
                set(
                    this.translateX,
                    block([
                        cond(clockRunning(this.decayClock), 0, [
                            cond(wasStartedFromBegin, 0, [
                                set(wasStartedFromBegin, 1),
                                set(this.stateDecay.finished, 0),
                                set(
                                    this.stateDecay.velocity,
                                    multiply(this.velocityX, velocityFactor)
                                ),
                                set(this.stateDecay.position, this.translateX),
                                set(this.stateDecay.time, 0),
                                startClock(this.decayClock)
                            ])
                        ]),
                        cond(
                            clockRunning(this.decayClock),
                            decay(this.decayClock, this.stateDecay, config)
                        ),
                        cond(this.stateDecay.finished, [
                            stopClock(this.decayClock)
                        ]),
                        this.stateDecay.position
                    ])
                )
            ],
            [
                stopClock(this.decayClock),
                cond(eq(this.panState, State.BEGAN), [
                    set(wasStartedFromBegin, 0)
                ])
            ]
        );
    }

    withInfinit() {
        const offset = new Value(0);
        return cond(
            greaterThan(this.translateX, 5),
            [
                set(this.scrollState, SCROLL_STATE.ON_TOP),

                stopClock(this.decayClock),

                set(offset, sub(this.translateX, 0)),
                set(this.translateX, add(multiply(-1, this.endItem.x), offset)),
                set(this.scrollState, SCROLL_STATE.ON_SCROLL),

                set(this.stateDecay.position, this.translateX),
                startClock(this.decayClock)
            ],
            cond(
                and(
                    this.widthContent,
                    lessThan(
                        this.translateX,
                        add(sub(deviceWidth, this.widthContent), 5)
                    )
                ),
                [
                    set(this.scrollState, SCROLL_STATE.ON_END),

                    stopClock(this.decayClock),
                    stopClock(this.timingClock),

                    set(
                        this.translateX,
                        add(sub(this.endItem.x, this.widthContent), deviceWidth)
                    ),
                    set(this.scrollState, SCROLL_STATE.ON_SCROLL),

                    set(this.stateDecay.position, this.translateX),
                    startClock(this.decayClock)
                ],
                set(this.scrollState, SCROLL_STATE.ON_SCROLL)
            )
        );
    }

    wrapData(props = this.props) {
        const { data = [], numberLoop = 8 } = props;
        if (_.isEmpty(data)) return;
        if (_.size(data) < numberLoop) return data;
        const firstArr = _.take(data, numberLoop);
        const newData = _.concat(data, firstArr);
        const size = _.size(newData);
        const result = {};
        _.map(newData, (item, index) => {
            if (index < size - numberLoop) {
                result['main' + index] = { key: index, data: item };
            } else {
                const curIndex = index - size + numberLoop;
                result['extend' + curIndex] = {
                    key: index,
                    data: item
                };
                if (curIndex === 0) {
                    this.endItem.x.setValue(index * WIDTH_ROW);
                    this.endItem.width.setValue(WIDTH_ROW);
                }
            }
        });

        return result;
    }

    renderContent(data) {
        return _.map(data, (item, key) => {
            return (
                <Animated.View key={key}>
                    {this.props.renderItem({
                        item: item.data,
                        index: item.key
                    })}
                </Animated.View>
            );
        });
    }

    withHandlePan() {
        return cond(eq(this.tapState, State.BEGAN), [
            stopClock(this.decayClock),
            stopClock(this.timingClock)
        ]);
    }

    snapToTop() {
        // this.resetState.setValue(1)
    }

    autoScroll(timeout = 1) {
        setTimeout(() => {
            this.autoState.setValue(AUTO_STATE.START);
        }, timeout);
    }

    disAutoScroll() {
        this.autoState.setValue(AUTO_STATE.STOP);
    }

    handleOnScroll = this.handleOnScroll.bind(this);
    handleOnScroll({ contentOffset: { x } }) {
        return block([set(this.props._scrollValue, Animated.multiply(x, -1))]);
    }

    getBatch() {
        const { numberLoop } = this.props;
        const startIndex = this.state.startIndex;
        const endIndex = startIndex + 6;
        const arrKey = _.keys(this.data);

        let keySlice = _.slice(arrKey, startIndex, endIndex);
        const dataSplit = _.pick(this.data, keySlice);

        let headerWidth = startIndex * WIDTH_ROW;
        let footerWidth = (_.size(this.data) - endIndex) * WIDTH_ROW;

        let firstDataSplit = [];
        if (startIndex >= _.size(arrKey) - 4) {
            keySlice = _.slice(arrKey, 0, 4);
            firstDataSplit = _.pick(this.data, keySlice);
            headerWidth = (startIndex - 4) * WIDTH_ROW;
        }
        let lastDataSplit = [];
        if (startIndex <= 4) {
            keySlice = _.slice(
                arrKey,
                _.size(arrKey) - numberLoop,
                _.size(arrKey)
            );
            lastDataSplit = _.pick(this.data, keySlice);
            footerWidth =
                (_.size(this.data) - endIndex - numberLoop) * WIDTH_ROW;
        }

        return {
            dataSplit,
            headerWidth,
            footerWidth,
            firstDataSplit,
            lastDataSplit
        };
    }

    handleOnChangeIndex = this.handleOnChangeIndex.bind(this);
    handleOnChangeIndex([i]) {
        const newIndex = Math.max(_.floor(i) - 1, 0);
        newIndex !== this.state.startIndex &&
            this.setState({ startIndex: newIndex });
    }

    handleRenderBatch() {
        const clock = new Clock();

        const velocity = new Value(0);
        const dt = diff(clock);

        const dist = diff(this.translateX);

        const delayTime = new Value(0);
        const curIndex = new Value(0);
        const renderIndex = new Value(0);

        return [
            cond(eq(this.panState, State.BEGAN), startClock(clock)),
            set(delayTime, add(delayTime, dt)),
            cond(greaterThan(delayTime, 100), [
                set(velocity, divide(dist, delayTime)),
                set(delayTime, 0)
            ]),
            cond(lessThan(abs(velocity), 0.7), [
                set(
                    curIndex,
                    divide(abs(this.translateX), WIDTH_ROW),
                    cond(
                        or(
                            eq(this.panState, State.BEGAN),
                            eq(this.panState, State.CANCELLED)
                        ),
                        stopClock(clock)
                    )
                )
            ]),
            cond(greaterThan(abs(sub(curIndex, renderIndex)), 1), [
                set(renderIndex, curIndex),
                call([renderIndex], this.handleOnChangeIndex)
            ])
        ];
    }

    render() {
        const { wrapperStyle } = this.props;
        if (_.size(this.data) <= this.props.numberLoop) {
            return (
                <Animated.View
                    style={[
                        {
                            height: this.heightContent,
                            width: this.widthContent
                        },
                        wrapperStyle
                    ]}
                >
                    <ScrollView
                        scrollEventThrottle={0.3}
                        onScroll={Animated.event([
                            {
                                nativeEvent: this.handleOnScroll
                            }
                        ])}
                        style={[
                            this.props.style,
                            {
                                position: 'absolute',
                                width: deviceWidth
                            },
                            wrapperStyle
                        ]}
                        horizontal
                        onLayout={this.onContentLayout}
                        showsHorizontalScrollIndicator={false}
                    >
                        {_.map(this.props.data, (item, index) =>
                            this.props.renderItem({ item, index })
                        )}
                    </ScrollView>
                </Animated.View>
            );
        }

        const {
            dataSplit,
            headerWidth,
            footerWidth,
            firstDataSplit,
            lastDataSplit
        } = this.getBatch();

        return (
            <PanGestureHandler
                maxPointers={1}
                minDist={10}
                enabled={this.props.dragEnabled}
                onGestureEvent={this._onGestureEvent}
                onHandlerStateChange={this._onGestureEvent}
            >
                <Animated.View>
                    <TapGestureHandler onHandlerStateChange={this.handleTap}>
                        <Animated.View
                            style={[
                                {
                                    height: this.heightContent,
                                    width: this.widthContent
                                },
                                wrapperStyle
                            ]}
                        >
                            <Animated.View
                                onLayout={this.onContentLayout}
                                style={[
                                    {
                                        flexDirection: 'row',
                                        position: 'absolute',
                                        overflow: 'hidden'
                                    },
                                    {
                                        transform: [
                                            { translateX: this.translateX }
                                        ]
                                    }
                                ]}
                            >
                                {this.renderContent(firstDataSplit)}
                                <View style={{ width: headerWidth }} />
                                {this.renderContent(dataSplit)}
                                <View style={{ width: footerWidth }} />
                                {this.renderContent(lastDataSplit)}
                            </Animated.View>
                        </Animated.View>
                    </TapGestureHandler>
                    <Animated.Code
                        exec={block([
                            this.withHandlePan(),
                            this.withPreAdditiveOffset(),
                            this.withDecaying(),
                            this.withInfinit(),
                            this.withAutoScroll(),
                            cond(eq(this.autoState, AUTO_STATE.STOP), [
                                set(this.autoState, AUTO_STATE.UNDETERMINED),
                                stopClock(this.timingClock)
                            ]),
                            cond(this.resetState, [
                                set(this.resetState, 0),
                                set(this.translateX, 0),
                                stopClock(this.decayClock),
                                stopClock(this.timingClock)
                            ]),
                            ...this.handleRenderBatch(),
                            set(this.props._scrollValue, this.translateX)
                        ])}
                    />
                </Animated.View>
            </PanGestureHandler>
        );
    }
}

InfinitScroll.defaultProps = {
    _scrollValue: new Value(0),
    speed: 3000,
    delayAfterTouchEnd: 2000
};
