import React, {
    useRef,
    useState,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo
} from 'react';
import { Platform, ScrollView } from 'react-native';
import _ from 'lodash';
import Animated from 'react-native-reanimated';
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';
import produce from 'immer';

import { createPanEvent, GESTURE_AXIS } from '../TradeList/tradelist.hook';
import { DEVICE_WIDTH, NUMBER_LOOP } from '../enum';

const DURATION = 10000;

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
    timing,
    debug,
    greaterOrEq,
    ceil,
    floor
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

const useLayout = (_heightContent) => {
    const [p] = useState(() => {
        const widthContent = new Value(0);
        const heightContent = _heightContent || new Value(0);

        const onLayout = ({
            nativeEvent: {
                layout: { width, height }
            }
        }) => {
            widthContent.setValue(width);
            heightContent.setValue(height);
        };

        return [widthContent, heightContent, onLayout];
    });

    return p;
};

const stopWhenTouch = (_tapState, _panState, decayClock, timingClock) => {
    return cond(or(eq(_tapState, State.BEGAN), eq(_panState, State.BEGAN)), [
        stopClock(decayClock),
        stopClock(timingClock)
    ]);
};

const convertToScrollValue = (_panState, _gesture, _trans) => {
    const _prevGesture = new Value(0);
    const _offset = new Value(0);

    return cond(
        eq(_panState, State.BEGAN),
        [set(_prevGesture, _gesture)],
        [
            set(_offset, sub(_gesture, _prevGesture)),
            set(_trans, add(_trans, _offset)),
            set(_prevGesture, _gesture)
        ]
    );
};

const decayValue = ({
    _panState,
    _tapState,
    _trans,
    _velocity,
    decayClock,
    stateDecay,
    timingClock
}) => {
    const wasStartedFromBegin = new Value(0);

    const config = { deceleration };

    return cond(
        and(
            not(clockRunning(timingClock)),
            greaterThan(abs(multiply(_velocity, velocityFactor)), 5),
            eq(_panState, State.END),
            or(eq(_tapState, State.FAILED), eq(_tapState, State.CANCELLED))
        ),
        [
            set(
                _trans,
                block([
                    cond(clockRunning(decayClock), 0, [
                        cond(wasStartedFromBegin, 0, [
                            set(wasStartedFromBegin, 1),
                            set(stateDecay.finished, 0),
                            set(
                                stateDecay.velocity,
                                multiply(_velocity, velocityFactor)
                            ),
                            set(stateDecay.position, _trans),
                            set(stateDecay.time, 0),
                            startClock(decayClock)
                        ])
                    ]),
                    cond(
                        clockRunning(decayClock),
                        decay(decayClock, stateDecay, config)
                    ),
                    cond(stateDecay.finished, [stopClock(decayClock)]),
                    stateDecay.position
                ])
            )
        ],
        [
            stopClock(decayClock),
            cond(eq(_panState, State.BEGAN), [set(wasStartedFromBegin, 0)])
        ]
    );
};

const gcdTwoNumbers = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x;
};

const lcmTwoNumbers = (x, y) => {
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    return !x || !y ? 0 : Math.abs((x * y) / gcdTwoNumbers(x, y));
};

const loopInfinit = (_trans, stateDecay, sizeData, widthItem) => {
    const lcm = lcmTwoNumbers(NUMBER_LOOP, sizeData);
    return block([
        cond(lessThan(_trans, -lcm * widthItem), [
            set(_trans, 0),
            set(stateDecay.position, 0)
        ]),
        cond(greaterThan(_trans, lcm * widthItem), [
            set(_trans, 0),
            set(stateDecay.position, 0)
        ])
    ]);
};

const autoScroll = ({
    _autoState,
    _panState,
    _tapState,
    _trans,
    decayClock,
    timingClock
}) => {
    const isEndTouch = and(
        neq(_tapState, State.BEGAN),
        or(eq(_panState, State.END), eq(_tapState, State.END)),
        not(clockRunning(decayClock))
    );

    const isFirstState = and(
        eq(_panState, State.UNDETERMINED),
        eq(_tapState, State.UNDETERMINED),
        eq(_autoState, AUTO_STATE.START)
    );

    const prevClock = new Value(0);

    return cond(or(isEndTouch, isFirstState), [
        cond(
            clockRunning(timingClock),
            [
                set(
                    _trans,
                    sub(
                        _trans,
                        multiply(
                            sub(timingClock, prevClock),
                            DEVICE_WIDTH / DURATION
                        )
                    )
                ),
                set(prevClock, timingClock)
            ],
            [set(prevClock, timingClock), startClock(timingClock)]
        )
    ]);
};

let ScrollAnimated = ({
    _autoState,
    _gesture,
    _panState,
    _tapState,
    _trans,
    _velocity,
    sizeData,
    widthItem
}) => {
    const [stateDecay] = useState(() => ({
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    }));

    const [decayClock] = useState(() => new Clock());
    const [timingClock] = useState(() => new Clock());

    const stopWhenTouchAni = useMemo(
        () => stopWhenTouch(_tapState, _panState, decayClock, timingClock),
        [_tapState, _panState]
    );

    const convertToScrollValueAni = useMemo(
        () => convertToScrollValue(_panState, _gesture, _trans),
        [_panState, _gesture, _trans]
    );

    const decayAni = useMemo(
        () =>
            decayValue({
                _panState,
                _tapState,
                _trans,
                _velocity,
                decayClock,
                stateDecay,
                timingClock
            }),
        [_panState, _tapState, _trans, _velocity]
    );

    const autoAni = useMemo(
        () =>
            autoScroll({
                _autoState,
                _panState,
                _tapState,
                _trans,
                decayClock,
                timingClock
            }),
        [_autoState, _panState, _tapState, _trans]
    );

    const handleAutoAni = useMemo(
        () =>
            cond(eq(_autoState, AUTO_STATE.STOP), [
                set(_autoState, AUTO_STATE.UNDETERMINED),
                stopClock(timingClock)
            ]),
        [_autoState]
    );

    return (
        <Animated.View
            style={{
                transform: [
                    {
                        translateX: block([
                            stopWhenTouchAni,
                            convertToScrollValueAni,
                            decayAni,
                            loopInfinit(
                                _trans,
                                stateDecay,
                                sizeData,
                                widthItem
                            ),
                            autoAni,
                            handleAutoAni,
                            0
                        ])
                    }
                ]
            }}
        />
    );
};

ScrollAnimated = React.memo(ScrollAnimated);

const DefaultList = ({ heightItem, data, renderItem }) => (
    <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{
            height: heightItem,
            width: DEVICE_WIDTH
        }}
        contentContainerStyle={{
            alignItems: 'flex-end'
        }}
    >
        {_.map(data, (item, index) => renderItem({ item, index }))}
    </ScrollView>
);

const initDicIndex = () => {
    const self = {};
    for (let i = 0; i < NUMBER_LOOP; i++) {
        self[i] = {
            mapWithIndexData: i, // item ung voi data nao (data[index])
            mapWithIndexUI: i //  item ung voi vi tri nao tren UI (tinh tu trai sang)
        };
    }
    return self;
};

let ScrollBlock = ({
    children,
    sizeData,
    heightItem,
    _trans,
    _autoState,
    widthItem
}) => {
    const [[_tapState, handleTap]] = useState(() => {
        const _tapState = new Value(State.UNDETERMINED);

        return [_tapState, event([{ nativeEvent: { state: _tapState } }])];
    });

    const [[onGestureEvent, { _gesture, _velocity, _state }]] = useState(() =>
        createPanEvent(GESTURE_AXIS.X_AXIS)
    );

    return (
        <React.Fragment>
            <PanGestureHandler
                maxPointers={1}
                minDist={10}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onGestureEvent}
            >
                <Animated.View>
                    <TapGestureHandler onHandlerStateChange={handleTap}>
                        <Animated.View
                            style={{
                                height: heightItem,
                                width: DEVICE_WIDTH,
                                transform: [{ translateX: _trans }]
                            }}
                        >
                            {children}
                        </Animated.View>
                    </TapGestureHandler>
                </Animated.View>
            </PanGestureHandler>
            <ScrollAnimated
                _autoState={_autoState}
                _gesture={_gesture}
                _panState={_state}
                _tapState={_tapState}
                _trans={_trans}
                _velocity={_velocity}
                sizeData={sizeData}
                widthItem={widthItem}
            />
        </React.Fragment>
    );
};
ScrollBlock = React.memo(ScrollBlock);

const useScroll = ({ _dicIndex, _trans, sizeData, setDicIndex, widthItem }) => {
    const handleChange = (i, isUpper, isReset) => {
        if (isReset) {
            _dicIndex.current = produce(_dicIndex.current, (draft) => {
                // mapWithIndexData: i, // item ung voi data nao (data[index])
                // mapWithIndexUI: i //  item ung voi vi tri nao tren UI (tinh tu trai sang)
                draft[i].mapWithIndexData = i;
            });
        } else {
            _dicIndex.current = produce(_dicIndex.current, (draft) => {
                draft[i].mapWithIndexData = isUpper
                    ? draft[i].mapWithIndexData + NUMBER_LOOP
                    : draft[i].mapWithIndexData - NUMBER_LOOP;
                // return newState;

                if (draft[i].mapWithIndexData < 0) {
                    draft[i].mapWithIndexData =
                        draft[i].mapWithIndexData + sizeData.current;
                }
                if (draft[i].mapWithIndexData >= sizeData.current) {
                    draft[i].mapWithIndexData =
                        draft[i].mapWithIndexData - sizeData.current;
                }

                // reSort UIIndex
                if (isUpper) {
                    const max = _.maxBy(
                        _.values(_dicIndex.current),
                        (item) => item.mapWithIndexUI
                    );
                    draft[i].mapWithIndexUI = max.mapWithIndexUI + 1;
                } else {
                    const min = _.minBy(
                        _.values(_dicIndex.current),
                        (item) => item.mapWithIndexUI
                    );
                    draft[i].mapWithIndexUI = min.mapWithIndexUI - 1;
                }
            });
        }
        const debounce = _.debounce(() => setDicIndex(_dicIndex.current), 50);
        debounce();
    };

    const [data, setData] = useState(() => {
        const result = {};

        for (let i = 0; i < NUMBER_LOOP; i++) {
            result[i] = {};

            const trans = new Value(0);
            const tmpLeft = new Value(0);
            const tmpRight = new Value(0);

            const prevTrans = new Value(0);
            const diffValue = sub(trans, prevTrans);

            const hideInLeft = lessThan(
                add(trans, i * widthItem),
                sub(multiply(_trans, -1), 50)
            );

            const hideInRight = greaterThan(
                add(trans, i * widthItem),
                add(multiply(_trans, -1), DEVICE_WIDTH + 50)
            );

            const calculateLeft = ceil(
                divide(
                    sub(0, _trans, 50, i * widthItem, trans),
                    multiply(NUMBER_LOOP * widthItem)
                )
            );

            const calculateRight = ceil(
                divide(
                    add(_trans, -DEVICE_WIDTH, -50, i * widthItem, trans),
                    multiply(NUMBER_LOOP * widthItem)
                )
            );

            result[i]._transX = block([
                cond(hideInLeft, [
                    set(tmpLeft, calculateLeft),
                    set(
                        trans,
                        add(trans, multiply(NUMBER_LOOP * widthItem, tmpLeft))
                    )
                ]),
                cond(hideInRight, [
                    set(tmpRight, calculateRight),
                    set(
                        trans,
                        sub(trans, multiply(NUMBER_LOOP * widthItem, tmpRight))
                    )
                ]),
                cond(
                    diffValue,
                    call([diffValue], ([d]) => {
                        handleChange(
                            i,
                            d > 0,
                            Math.abs(d) > NUMBER_LOOP * widthItem
                        );
                    })
                ),
                set(prevTrans, trans),
                trans
            ]);
        }
        return result;
    });

    // ------------

    return [data, setData];
};

let InfinitScroll = (
    { data: marketData, heightItem, widthItem, renderItem },
    ref
) => {
    const [_trans] = useState(() => new Value(0));
    const [_autoState] = useState(() => new Value(AUTO_STATE.UNDETERMINED));

    const sizeData = useRef(0);
    sizeData.current = _.size(marketData);

    const _dicIndex = useRef(initDicIndex());
    const [dicIndex, setDicIndex] = useState(() => _dicIndex.current);
    const [data, setData] = useScroll({
        _trans,
        _dicIndex,
        sizeData,
        setDicIndex,
        widthItem
    });

    const wrapIndexData = (state) => {
        let newState = state;
        if (state < 0) {
            newState = state + sizeData.current;
        }
        if (state >= sizeData.current) {
            newState = state - sizeData.current;
        }

        return newState;
    };

    useEffect(() => {
        if (!sizeData.current) return;

        _dicIndex.current = produce(_dicIndex.current, (draft) => {
            for (let i = 0; i < NUMBER_LOOP; i++) {
                draft[i].mapWithIndexLoop = i;
            }
        });

        const sortArr = _.sortBy(
            _dicIndex.current,
            (item) => item.mapWithIndexUI
        );

        let firstIndexOfItem = 0;
        const indexOfItem = sortArr[0].mapWithIndexData;

        if (_.isEmpty(marketData[indexOfItem])) {
            firstIndexOfItem = wrapIndexData(indexOfItem - 1);
        } else {
            firstIndexOfItem = indexOfItem;
        }

        const newArr = _.map(sortArr, (item, i) => ({
            ...item,
            mapWithIndexData: wrapIndexData(firstIndexOfItem + i)
        }));

        _dicIndex.current = produce(_dicIndex.current, (draft) => {
            _.forEach(newArr, (item) => (draft[item.mapWithIndexLoop] = item));
        });

        const debounce = _.debounce(() => setDicIndex(_dicIndex.current), 50);
        debounce();
    }, [sizeData.current]);

    useEffect(() => {
        setData(
            produce(data, (draft) => {
                for (let i = 0; i < NUMBER_LOOP; i++) {
                    const indexOfItem = dicIndex[i].mapWithIndexData;
                    draft[i].itemData = marketData[indexOfItem];
                }
            })
        );
    }, [dicIndex, marketData]);

    const content = _.map(data, ({ _transX, itemData }, index) => {
        const key = _.isNil(dicIndex[index]) ? index : dicIndex[index];
        return (
            <Animated.View
                key={index}
                style={{
                    height: '100%',
                    position: 'absolute',
                    transform: [
                        {
                            translateX: index * widthItem
                        },
                        {
                            translateX: _transX
                        }
                    ]
                }}
            >
                {renderItem({
                    item: itemData,
                    index: key
                })}
            </Animated.View>
        );
    });

    useImperativeHandle(ref, () => ({
        autoScroll: (timeout = 1) => {
            setTimeout(() => {
                _autoState.setValue(AUTO_STATE.START);
            }, timeout);
        },
        disAutoScroll: () => {
            _autoState.setValue(AUTO_STATE.STOP);
        },
        snapToTop: () => { }
    }));

    if (sizeData.current < 5) {
        return (
            <DefaultList
                data={marketData}
                renderItem={renderItem}
                heightItem={heightItem}
            />
        );
    }
    return (
        <ScrollBlock
            _trans={_trans}
            _autoState={_autoState}
            sizeData={sizeData.current}
            heightItem={heightItem}
            widthItem={widthItem}
        >
            {content}
        </ScrollBlock>
    );
};

InfinitScroll = forwardRef(InfinitScroll);
InfinitScroll = React.memo(InfinitScroll);

export default InfinitScroll;
