import React, { PureComponent } from 'react';
import { Platform, Dimensions, ScrollView as RNScrollView } from 'react-native';
import _ from 'lodash';
import Animated, { Easing } from 'react-native-reanimated';
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';

const ScrollView = Animated.createAnimatedComponent(RNScrollView);

const { width: deviceWidth } = Dimensions.get('window');

const {
    add,
    cond,
    divide,
    eq,
    neq,
    event,
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
    call,
    onChange
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
        this.data = this.wrapData();

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

        this.dicItem = {};
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
                eq(this.tapState, State.FAILED)
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
                result['extend' + (index - size + numberLoop)] = {
                    key: index,
                    data: item
                };
            }
        });

        return result;
    }

    renderContent() {
        return _.map(this.data, (item, key) => {
            let onLayout;
            if (!this.dicItem[key]) {
                this.dicItem[key] = {
                    x: new Value(0),
                    width: new Value(0),
                    isViewable: new Value(0)
                };
            }

            if (this.props.onViewableItemsChanged) {
                onLayout = ({
                    nativeEvent: {
                        layout: { x, width }
                    }
                }) => {
                    this.dicItem[key].x.setValue(x);
                    this.dicItem[key].width.setValue(width);
                };
            }

            if (key === 'extend0') {
                onLayout = ({
                    nativeEvent: {
                        layout: { x, width }
                    }
                }) => {
                    this.endItem.x.setValue(x);
                    this.endItem.width.setValue(width);

                    if (this.props.onViewableItemsChanged) {
                        this.dicItem[key].x.setValue(x);
                        this.dicItem[key].width.setValue(width);
                    }
                };
            }

            return (
                <Animated.View onLayout={onLayout}>
                    {this.props.renderItem({
                        item: item.data,
                        index: item.key,
                        keyInfinit: key
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

    // withOnViewableItemsChanged() {
    //     if (!this.props.onViewableItemsChanged) return []
    //     return _.map(this.dicItem, ({ x, width, isViewable }, key) => ([
    //         cond(
    //             and(
    //                 greaterThan(add(x, width), multiply(this.translateX, -1)),
    //                 lessThan(x, add(multiply(this.translateX, -1), deviceWidth))
    //             ),
    //             cond(not(isViewable), set(this.dicItem[key].isViewable, 1)),
    //             cond(isViewable, set(this.dicItem[key].isViewable, 0))
    //         ),
    //         onChange(this.dicItem[key].isViewable, call(
    //             [this.dicItem[key].isViewable],
    //             ([isViewable]) => {
    //                 const { data: item } = this.data[key] || {}
    //                 item && this.props.onViewableItemsChanged({ 'changed': [{ item, isViewable: !!isViewable, keyInfinit: key }] })
    //             }
    //         ))
    //     ]))
    // }

    renderItem = this.renderItem.bind(this);
    renderItem({ item, index }) {
        const keyInfinit = `main${index}`;
        return this.props.renderItem({ item, index, keyInfinit });
    }

    handleOnScroll = this.handleOnScroll.bind(this);
    handleOnScroll({ contentOffset: { x } }) {
        return block([set(this.props._scrollValue, x)]);
    }

    render() {
        const { wrapperStyle } = this.props;
        if (_.size(this.data) <= this.props.numberLoop) {
            // Map lai keyInfinit để forceUpdate
            return (
                <Animated.View
                    style={[{
                        height: this.heightContent,
                        width: this.widthContent
                    }, wrapperStyle]}
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
                            this.renderItem({ item, index })
                        )}
                    </ScrollView>
                </Animated.View>
            );
        }

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
                            style={[{
                                // marginTop: 50,
                                height: this.heightContent,
                                width: this.widthContent
                            }, wrapperStyle]}
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
                                {this.renderContent()}
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
                            // this.withOnViewableItemsChanged(),
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
