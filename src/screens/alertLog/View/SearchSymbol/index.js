import React, { Component, PureComponent, useRef, useCallback } from 'react';
import { Dimensions, Platform, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import Animated from 'react-native-reanimated';
import PropTypes from 'prop-types'
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';
import CommonStyle from '~/theme/theme_controller';
import HandleDismissKeyboard from './HandleDismissKeyboard'
const { height: screenHeight } = Dimensions.get('window');

const P = (android, ios) => Platform.OS === 'ios' ? ios : android;

const magic = {
    damping: P(9, 7),
    mass: 0.3,
    stiffness: 121.6,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
    deceleration: 0.999,
    bouncyFactor: 1,
    velocityFactor: P(1, 1.2),
    dampingForMaster: 50,
    tossForMaster: 0.4,
    coefForTranslatingVelocities: 5
};

const {
    damping,
    dampingForMaster,
    mass,
    stiffness,
    overshootClamping,
    restSpeedThreshold,
    restDisplacementThreshold,
    deceleration,
    velocityFactor,
    tossForMaster
} = magic;

const { lessOrEq, call, abs, set, cond, onChange, block, eq, greaterOrEq, not, defined, max, add, and, Value, spring, or, divide, greaterThan, sub, event, diff, multiply, clockRunning, startClock, stopClock, decay, Clock, lessThan, neq } = Animated;

function runDecay(clock, value, velocity, wasStartedFromBegin) {
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    const config = { deceleration };

    return [
        cond(clockRunning(clock), 0, [
            cond(wasStartedFromBegin, 0, [
                set(wasStartedFromBegin, 1),
                set(state.finished, 0),
                set(state.velocity, multiply(velocity, velocityFactor)),
                set(state.position, value),
                set(state.time, 0),
                startClock(clock)
            ])
        ]),
        cond(clockRunning(clock), decay(clock, state, config)),
        cond(state.finished, stopClock(clock)),
        state.position
    ];
}

function withPreservingAdditiveOffset(drag, state) {
    const prev = new Animated.Value(0);
    const valWithPreservedOffset = new Animated.Value(0);
    return block([
        cond(eq(state, State.BEGAN), [
            set(prev, 0)
        ], [
            set(valWithPreservedOffset, add(valWithPreservedOffset, sub(drag, prev))),
            set(prev, drag)
        ]),
        valWithPreservedOffset
    ]);
}

function withDecaying(drag, state, decayClock, velocity, prevent) {
    const valDecayed = new Animated.Value(0);
    const offset = new Animated.Value(0);
    // since there might be moar than one clock
    const wasStartedFromBegin = new Animated.Value(0);
    return block([
        cond(eq(state, State.END),
            [
                cond(prevent,
                    stopClock(decayClock),
                    set(valDecayed, runDecay(decayClock, add(drag, offset), velocity, wasStartedFromBegin))
                )
            ],
            [
                stopClock(decayClock),
                cond(eq(state, State.BEGAN, set(prevent, 0))),
                cond(eq(state, State.BEGAN), [
                    set(wasStartedFromBegin, 0),
                    set(offset, add(sub(valDecayed, drag)))
                ]),
                set(valDecayed, add(drag, offset))
            ]
        ),
        valDecayed
    ]);
}

function runSpring(clock, value, velocity, dest, damping = P(9, 7), wasRun = 0, isManuallySet = 0, onDone) {
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    const config = {
        damping,
        mass,
        stiffness,
        overshootClamping,
        restSpeedThreshold,
        restDisplacementThreshold,
        toValue: new Value(0)
    };

    return [
        cond(clockRunning(clock), 0, [
            set(state.finished, 0),
            set(state.velocity, velocity),
            set(state.position, value),
            set(config.toValue, dest),
            cond(and(wasRun, not(isManuallySet)), 0, startClock(clock)),
            cond(defined(wasRun), set(wasRun, 1))
        ]),
        spring(clock, state, config),
        cond(state.finished, [stopClock(clock), call([state.position], ([a]) => onDone && onDone(a))]),
        state.position
    ];
}
export const useRefBottomSheet = () => {
    const refBottomSheet = useRef()
    const show = useCallback(() => {
        refBottomSheet.current && refBottomSheet.current.show()
    }, [])
    const hide = useCallback(() => {
        refBottomSheet.current && refBottomSheet.current.hide()
    }, [])
    return { refBottomSheet, show, hide }
}
export default class BottomSheetBehavior extends Component {
    static defaultProps = {
        initialSnap: 1,
        enabledManualSnapping: true,
        enabledGestureInteraction: true,
        enabledInnerScrolling: true
    };

    decayClock = new Clock();
    panState = new Value(0);
    tapState = new Value(0);
    velocity = new Value(0);
    panMasterState = new Value(State.END);
    masterVelocity = new Value(0);
    isManuallySetValue = new Animated.Value(0);
    manuallySetValue = new Animated.Value(0);
    masterClockForOverscroll = new Clock();
    preventDecaying = new Animated.Value(0);
    dragMasterY = new Value(0);
    dragY = new Value(0);
    onOpenStartValue = new Value(0)
    onOpenEndValue = new Value(0)
    onCloseStartValue = new Value(1)
    onCloseEndValue = new Value(0)
    initMount = new Value(1)
    constructor(props) {
        super(props);
        this.state = BottomSheetBehavior.getDerivedStateFromProps(props);
        const { snapPoints, init } = this.state;
        const middlesOfSnapPoints = [];
        for (let i = 1; i < snapPoints.length; i++) {
            middlesOfSnapPoints.push(divide(add(snapPoints[i - 1], snapPoints[i]), 2));
        }
        const masterOffseted =
            new Value(init);
        // destination point is a approximation of movement if finger released
        const destinationPoint = add(masterOffseted, multiply(tossForMaster, this.masterVelocity));
        const destinationPointRunContent = add(masterOffseted, multiply(tossForMaster, this.velocity));
        // method for generating condition for finding the nearest snap point
        const currentSnapPoint = (i = 0) => i + 1 === snapPoints.length ? snapPoints[i] : cond(
            lessThan(destinationPoint, middlesOfSnapPoints[i]),
            snapPoints[i],
            currentSnapPoint(i + 1)
        );
        const currentSnapPointRunContent = (i = 0) => i + 1 === snapPoints.length ? snapPoints[i] : cond(
            lessThan(destinationPointRunContent, middlesOfSnapPoints[i]),
            snapPoints[i],
            currentSnapPoint(i + 1)
        );
        // current snap point desired
        this.snapPoint = currentSnapPoint();
        this.snapPointRunContent = currentSnapPointRunContent();
        const masterClock = new Clock();
        const prevMasterDrag = new Animated.Value(0);
        const wasRun = new Animated.Value(0);
        this.translateMaster = block([
            cond(eq(this.panMasterState, State.END),
                [
                    set(prevMasterDrag, 0),
                    cond(or(clockRunning(masterClock), not(wasRun), this.isManuallySetValue),
                        [
                            cond(this.isManuallySetValue, stopClock(masterClock)),
                            set(masterOffseted,
                                runSpring(masterClock, masterOffseted, this.masterVelocity,
                                    cond(this.isManuallySetValue, this.manuallySetValue, this.snapPoint),
                                    dampingForMaster, wasRun, this.isManuallySetValue)
                            ),
                            set(this.isManuallySetValue, 0)
                        ]
                    )
                ],
                [
                    stopClock(masterClock),
                    set(this.preventDecaying, 1),
                    set(masterOffseted, add(masterOffseted, sub(this.dragMasterY, prevMasterDrag))),
                    set(prevMasterDrag, this.dragMasterY),
                    cond(eq(this.panMasterState, State.BEGAN),
                        [
                            stopClock(this.masterClockForOverscroll),
                            set(wasRun, 0)
                        ]
                    )
                ]
            ),
            max(masterOffseted, snapPoints[0])
        ]);

        this.Y = this.withEnhancedLimits(
            withDecaying(
                withPreservingAdditiveOffset(this.dragY, this.panState),
                this.panState,
                this.decayClock,
                this.velocity,
                this.preventDecaying),
            masterOffseted);
        this.backdropOpacity = Animated.sub(0.8, Animated.multiply(divide(this.translateMaster, this.state.snapPoints[this.state.snapPoints.length - 1]), 0.8))
    }
    show = () => {
        this.snapTo(0)
    }
    hide = () => {
        this.snapTo(1)
    }
    handleMasterPan = event([{
        nativeEvent: ({
            translationY: this.dragMasterY,
            state: this.panMasterState,
            velocityY: this.masterVelocity
        })
    }]);

    handlePan = event([{
        nativeEvent: ({
            translationY: this.props.enabledInnerScrolling ? this.dragY : this.dragMasterY,
            state: this.props.enabledInnerScrolling ? this.panState : this.panMasterState,
            velocityY: this.props.enabledInnerScrolling ? this.velocity : this.masterVelocity
        })
    }]);

    handleTap = event([{ nativeEvent: { state: this.tapState } }]);

    withEnhancedLimits(val, masterOffseted) {
        const wasRunMaster = new Animated.Value(0);
        const min = multiply(-1, add(this.state.heightOfContent, this.state.heightOfHeaderAnimated));
        const prev = new Animated.Value(0);
        const limitedVal = new Animated.Value(0);
        const diffPres = new Animated.Value(0);
        const flagWasRunSpring = new Animated.Value(0);
        const justEndedIfEnded = new Animated.Value(1);
        const wasEndedMasterAfterInner = new Animated.Value(1);
        const prevMaster = new Animated.Value(1);
        const prevState = new Animated.Value(0);
        const isMasterRun = new Value(0)
        const translationMaster = new Value(0)
        const rev = new Animated.Value(0);
        return block([
            set(rev, limitedVal),
            cond(or(eq(this.panState, State.BEGAN), and(eq(this.panState, State.ACTIVE), eq(prevState, State.END))), [
                set(prev, val),
                set(flagWasRunSpring, 0),
                stopClock(this.masterClockForOverscroll),
                set(wasRunMaster, 0),
                set(isMasterRun, 0),
                set(translationMaster, 0),
                set(masterOffseted, 0)
            ], [
                set(limitedVal, add(limitedVal, sub(val, prev))),
                cond(lessThan(limitedVal, min), set(limitedVal, min))
            ]),
            set(prevState, this.panState), // some iOS shit
            set(diffPres, sub(prev, val)),
            set(prev, val),
            cond(or(greaterOrEq(limitedVal, 0),
                greaterThan(masterOffseted, 0))
                , [
                    cond(eq(this.panState, State.ACTIVE),
                        [
                            set(masterOffseted, sub(masterOffseted, diffPres)),
                            set(translationMaster, sub(translationMaster, diffPres)),
                            cond(greaterThan(translationMaster, 10), set(isMasterRun, 1))
                        ]
                    ),
                    cond(greaterThan(masterOffseted, 0), [
                        set(limitedVal, 0)
                    ]),
                    //   cond(not(eq(this.panMasterState, State.END)), set(wasEndedMasterAfterInner, 1)),
                    cond(not(eq(this.panState, State.END)), set(justEndedIfEnded, 1)),
                    cond(or(eq(this.panState, State.ACTIVE), eq(this.panMasterState, State.ACTIVE)), set(wasEndedMasterAfterInner, 0)),
                    cond(and(eq(prevMaster, State.ACTIVE), eq(this.panMasterState, State.END), eq(this.panState, State.END)), set(wasEndedMasterAfterInner, 1)),
                    set(prevMaster, this.panMasterState),
                    cond(and(eq(this.panState, State.END), eq(isMasterRun, 1), not(wasEndedMasterAfterInner), not(eq(this.panMasterState, State.ACTIVE)), not(eq(this.panMasterState, State.BEGAN)), or(clockRunning(this.masterClockForOverscroll), not(wasRunMaster))), [
                        // cond(justEndedIfEnded, set(this.masterVelocity, diff(val))),
                        set(this.masterVelocity, cond(justEndedIfEnded, diff(val), this.velocity)),
                        set(masterOffseted, runSpring(this.masterClockForOverscroll, masterOffseted, diff(val), this.snapPointRunContent, dampingForMaster, wasRunMaster)),
                        set(this.masterVelocity, 0)
                    ]),
                    //   cond(eq(this.panState, State.END), set(wasEndedMasterAfterInner, 0)),
                    cond(eq(this.panState, State.END), set(justEndedIfEnded, 0)),
                    set(this.preventDecaying, 1),
                    0
                ], [
                set(this.preventDecaying, 0),
                limitedVal
            ])
        ]);
    }

    panRef = React.createRef();

    snapTo = index => {
        if (!this.props.enabledManualSnapping) {
            return;
        }
        this.manuallySetValue.setValue(this.state.snapPoints[this.state.propsToNewIncides[index]]);
        this.isManuallySetValue.setValue(1);
    };
    scrollTo = translateY => {
        if (!this.props.enabledManualSnapping) {
            return;
        }
        this.manuallySetValue.setValue(translateY);
        this.isManuallySetValue.setValue(1);
    }
    height = new Animated.Value(screenHeight)

    handleLayoutHeader = ({
        nativeEvent: {
            layout: {
                height: heightOfHeader
            }
        }
    }) => {
        this.state.heightOfHeaderAnimated.setValue(heightOfHeader);
        this.setState({ heightOfHeader });
    };

    handleFullHeader = ({
        nativeEvent: {
            layout: {
                height
            }
        }
    }) => this.height.setValue(height)

    handleLayoutContent = ({
        nativeEvent: {
            layout: {
                height
            }
        }
    }) => {
        this.state.heightOfContent.setValue(height - this.props.snapPoints[0])
    };

    static renumber = str => Number(str.split('%')[0]) * screenHeight / 100
    static getDerivedStateFromProps(props, state) {
        let snapPoints;
        const sortedPropsSnapPints = props.snapPoints.map((s, i) => {
            if (typeof s === 'number') {
                return { val: s, ind: i };
            } else if (typeof s === 'string') {
                return { val: BottomSheetBehavior.renumber(s), ind: i };
            } else {
                // exception
            }
        }).sort(({ val: a }, { val: b }) => a < b);
        if (state && state.snapPoints) {
            state.snapPoints.forEach((s, i) => s.setValue(sortedPropsSnapPints[0].val - sortedPropsSnapPints[i].val));
            snapPoints = state.snapPoints;
        } else {
            snapPoints = sortedPropsSnapPints.map(p => new Value(sortedPropsSnapPints[0].val - p.val));
        }

        const propsToNewIncides = {};
        sortedPropsSnapPints.forEach(({ ind }, i) => propsToNewIncides[ind] = i);

        const { initialSnap } = props;

        return {
            init: sortedPropsSnapPints[0].val - sortedPropsSnapPints[propsToNewIncides[initialSnap]].val,
            propsToNewIncides,
            heightOfHeaderAnimated: (state && state.heightOfHeaderAnimated) || new Animated.Value(0),
            heightOfContent: (state && state.heightOfContent) || new Animated.Value(0),
            initSnap: sortedPropsSnapPints[0].val,
            snapPoints
        };
    }
    shouldComponentUpdate(nextProps) {
        if (this.props.keyExtractor !== nextProps.keyExtractor) return true
        return false
    }
    master = React.createRef();

    render() {
        const { heightOfHeader = 0 } = this.state
        const { zIndex = 100 } = this.props
        return (
            <React.Fragment>
                <Animated.View pointerEvents='none' style={{
                    height: '100%',
                    position: 'absolute',
                    backgroundColor: CommonStyle.backgroundColor,
                    width: '100%',
                    opacity: this.backdropOpacity
                }}
                    onLayout={this.handleFullHeader}
                />
                <Animated.View style={{
                    width: '100%',
                    position: 'absolute',
                    backgroundColor: CommonStyle.backgroundColor,
                    zIndex,
                    transform: [
                        {
                            translateY: this.translateMaster
                        },
                        {
                            translateY: sub(this.height, this.state.initSnap)
                        }
                    ]
                }}>
                    <PanGestureHandler
                        enabled={this.props.enabledGestureInteraction}
                        ref={this.master}
                        waitFor={this.panRef}
                        onGestureEvent={this.handleMasterPan}
                        onHandlerStateChange={this.handleMasterPan}
                    >
                        <Animated.View
                            style={{
                                zIndex: 101
                            }}
                            onLayout={this.handleLayoutHeader}
                        >
                            {this.props.renderHeader && this.props.renderHeader()}
                        </Animated.View>
                    </PanGestureHandler>
                    <KeyboardAvoidingView
                        enabled={false}
                        behavior="height">
                        <View
                            style={{
                                height: this.props.snapPoints[0] - heightOfHeader,
                                overflow: 'hidden'
                            }}
                        >
                            {
                                !this.props.enabledGestureInteraction ? (
                                    <React.Fragment >
                                        {this.props.renderContent && this.props.renderContent()}
                                    </React.Fragment>
                                ) : (
                                    <PanGestureHandler
                                        enabled={this.props.enabledGestureInteraction}
                                        waitFor={this.master}
                                        ref={this.panRef}
                                        onGestureEvent={this.handlePan}
                                        onHandlerStateChange={this.handlePan}
                                    >
                                        <Animated.View>
                                            <TapGestureHandler
                                                enabled={this.props.enabledGestureInteraction}
                                                onHandlerStateChange={this.handleTap}
                                            >
                                                <Animated.View
                                                    style={{
                                                        width: '100%',
                                                        transform: [
                                                            { translateY: this.Y }
                                                        ],
                                                        backgroundColor: CommonStyle.backgroundColor,
                                                        minHeight: this.props.snapPoints[0] - heightOfHeader
                                                    }}
                                                    onLayout={this.handleLayoutContent}
                                                >
                                                    {this.props.renderContent && this.props.renderContent()}
                                                </Animated.View>
                                            </TapGestureHandler>
                                        </Animated.View>
                                    </PanGestureHandler>
                                )
                            }

                            <Animated.Code
                                exec={onChange(this.tapState, cond(eq(this.tapState, State.BEGAN), stopClock(this.decayClock)))} />
                            {this.props.callbackNode &&
                                <Animated.Code
                                    exec={onChange(this.translateMaster, [
                                        set(this.props.callbackNode, divide(this.translateMaster, this.state.snapPoints[this.state.snapPoints.length - 1]))
                                    ])} />}
                            {/* <Animated.Code exec={block([
                            cond(eq(this.translateMaster, this.state.snapPoints[this.state.snapPoints.length - 1]), [call([], () => this.props.onHide && this.props.onHide())], []),
                            cond(eq(this.translateMaster, this.state.snapPoints[0]), [call([], () => this.props.onShow && this.props.onShow())], [])
                        ])} /> */}
                            {(this.props.onOpenStart || this.props.onCloseEnd) && (
                                <Animated.Code
                                    exec={onChange(this.translateMaster, [
                                        cond(
                                            and(
                                                lessOrEq(
                                                    divide(
                                                        this.translateMaster,
                                                        this.state.snapPoints[this.state.snapPoints.length - 1]
                                                    ),
                                                    1 -
                                                    (this.props.callbackThreshold
                                                        ? this.props.callbackThreshold
                                                        : 0.01)
                                                ),
                                                neq(this.onOpenStartValue, 1)
                                            ),
                                            [
                                                call([], () => {
                                                    if (this.props.onOpenStart) this.props.onOpenStart()
                                                }),
                                                set(this.onOpenStartValue, 1),
                                                set(this.initMount, 0),
                                                cond(
                                                    defined(this.onCloseEndValue),
                                                    set(this.onCloseEndValue, 0)
                                                )
                                            ]
                                        )
                                    ])}
                                />
                            )}
                            {(this.props.onOpenEnd || this.props.onCloseStart) && (
                                <Animated.Code
                                    exec={onChange(this.translateMaster, [
                                        cond(
                                            and(
                                                lessOrEq(
                                                    divide(
                                                        this.translateMaster,
                                                        this.state.snapPoints[this.state.snapPoints.length - 1]
                                                    ),
                                                    this.props.callbackThreshold
                                                        ? this.props.callbackThreshold
                                                        : 0.01
                                                ),
                                                neq(this.onOpenEndValue, 1)
                                            ),
                                            [
                                                call([], () => {
                                                    if (this.props.onOpenEnd) this.props.onOpenEnd()
                                                }),
                                                set(this.onOpenEndValue, 1),
                                                cond(
                                                    defined(this.onCloseStartValue),
                                                    set(this.onCloseStartValue, 0)
                                                )
                                            ]
                                        )
                                    ])}
                                />
                            )}
                            {(this.props.onCloseStart || this.props.onOpenEnd) && (
                                <Animated.Code
                                    exec={onChange(this.translateMaster, [
                                        cond(
                                            and(
                                                greaterOrEq(
                                                    divide(
                                                        this.translateMaster,
                                                        this.state.snapPoints[this.state.snapPoints.length - 1]
                                                    ),
                                                    this.props.callbackThreshold
                                                        ? this.props.callbackThreshold
                                                        : 0.01
                                                ),
                                                neq(this.onCloseStartValue, 1)
                                            ),
                                            [
                                                call([], () => {
                                                    if (this.props.onCloseStart) this.props.onCloseStart()
                                                }),
                                                set(this.onCloseStartValue, 1),
                                                cond(
                                                    defined(this.onCloseStartValue),
                                                    set(this.onOpenEndValue, 0)
                                                )
                                            ]
                                        )
                                    ])}
                                />
                            )}
                            {(this.props.onCloseEnd || this.props.onOpenStart) && (
                                <Animated.Code
                                    exec={onChange(this.translateMaster, [
                                        cond(
                                            and(
                                                greaterOrEq(
                                                    divide(
                                                        this.translateMaster,
                                                        this.state.snapPoints[this.state.snapPoints.length - 1]
                                                    ),
                                                    1 -
                                                    (this.props.callbackThreshold
                                                        ? this.props.callbackThreshold
                                                        : 0.01)
                                                ),
                                                neq(this.onCloseEndValue, 1),
                                                neq(this.initMount, 1)
                                            ),
                                            [
                                                call([], () => {
                                                    if (this.props.onCloseEnd) this.props.onCloseEnd()
                                                }),
                                                set(this.onCloseEndValue, 1),
                                                set(this.initMount, 0),
                                                cond(
                                                    defined(this.onOpenStartValue),
                                                    set(this.onOpenStartValue, 0)
                                                ),
                                                cond(
                                                    defined(this.onOpenEndValue),
                                                    set(this.onOpenEndValue, 0)
                                                )
                                            ]
                                        )
                                    ])}
                                />
                            )}
                            {
                                this.props.translateMaster && (
                                    <Animated.Code exec={onChange(this.translateMaster, set(this.props.translateMaster, this.translateMaster))} />
                                )
                            }
                            {
                                this.props.scrollValue && (
                                    <Animated.Code exec={onChange(this.Y, set(this.props.scrollValue, this.Y))} />
                                )
                            }
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </React.Fragment >
        );
    }
}
