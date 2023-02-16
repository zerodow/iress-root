import React, { useState, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import { View, StyleSheet } from 'react-native';

import produce from 'immer';
import Animated from 'react-native-reanimated';
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';

import {
    createPanEvent,
    GESTURE_AXIS
} from '~s/watchlist/TradeList/tradelist.hook';

import {
    calculateOffset,
    checkOnMergePanel,
    createLayout,
    decayContent,
    springValue,
    stopAllClock,
    transWithGesture,
    transWithBounce
} from './WatchlistNested.func';

import { DEVICE_HEIGHT, NESTED_STATE } from '~s/watchlist/enum';

const {
    sub,
    abs,
    Clock,
    Value,
    block,
    cond,
    lessThan,
    multiply,
    set,
    eq,
    not,
    clockRunning,
    or,
    and,
    greaterThan,
    divide,
    debug,
    call,
    max
} = Animated;

let HandleAnimated = ({
    _contentTrans,
    _gesture,
    _isPanPanel,
    _panState,
    _panelTrans,
    _status,
    _tapState,
    _velocity,
    heightContent,
    heightPanel,
    hideCallback
}) => {
    const hidePos = DEVICE_HEIGHT;
    const _offset = new Value(0);
    // const decayVelocity = new Value(0);
    const springClock1 = new Clock();
    const springClock2 = new Clock();
    const springClock3 = new Clock();
    const springClock4 = new Clock();
    const decayClock = new Clock();

    const limitPanel = cond(lessThan(_panelTrans, 0), set(_panelTrans, 0));

    const isTouchEnd = and(
        eq(_panState, State.END),
        or(
            eq(_tapState, State.FAILED),
            eq(_tapState, State.CANCELLED),
            eq(_tapState, State.END)
        )
    );

    const maxHeight = max(0, sub(heightContent, heightPanel));
    const whenStop = or(
        eq(_tapState, State.BEGAN),
        and(eq(_status, NESTED_STATE.HIDE), clockRunning(springClock3)),
        and(eq(_status, NESTED_STATE.SHOW), clockRunning(springClock4))
    );
    const translateX = block([
        set(_offset, calculateOffset({ _panState, _gesture })),
        transWithBounce(
            _offset,
            lessThan(_contentTrans, multiply(maxHeight, -1))
        ),
        transWithGesture({
            _contentTrans,
            _isPanPanel,
            _offset,
            _panState,
            _panelTrans
        }),
        stopAllClock({
            whenStop,
            arrClock: [
                decayClock,
                springClock1,
                springClock2,
                springClock3,
                springClock4
            ]
        }),

        decayContent({
            whenDecay: and(
                not(_isPanPanel),
                eq(_panelTrans, 0),
                // not(clockRunning(springClock)),
                greaterThan(abs(_velocity), 5),
                isTouchEnd
            ),
            _contentTrans,
            _panState,
            _velocity,
            decayClock
        }),

        // sping content when decay greaterThan 0(top)
        springValue({
            _trans: _contentTrans,
            _velocity,
            springClock: springClock1,
            whenSpring: and(
                not(_isPanPanel),
                eq(_panelTrans, 0),
                greaterThan(_contentTrans, 0),
                not(clockRunning(springClock1)),
                isTouchEnd
            )
        }),
        // sping content when greaterThan max height
        springValue({
            _trans: _contentTrans,
            _velocity,
            toValue: multiply(maxHeight, -1),
            springClock: springClock2,
            whenSpring: and(
                not(_isPanPanel),
                eq(_panelTrans, 0),
                lessThan(_contentTrans, multiply(maxHeight, -1)),
                not(clockRunning(springClock2)),
                isTouchEnd
            )
        }),

        cond(
            and(
                isTouchEnd,
                greaterThan(_panelTrans, 0),
                eq(_status, NESTED_STATE.UNDETERMINED)
            ),
            [
                cond(
                    lessThan(_panelTrans, divide(heightPanel, 2)),
                    set(_status, NESTED_STATE.SHOW),
                    set(_status, NESTED_STATE.HIDE)
                ),
                cond(
                    and(
                        not(clockRunning(springClock3)),
                        not(clockRunning(springClock4)),
                        greaterThan(_velocity, 500)
                    ),
                    set(_status, NESTED_STATE.HIDE)
                )
            ]
        ),

        // sping panel to top when show
        springValue({
            _trans: _panelTrans,
            _velocity,
            springClock: springClock3,
            whenSpring: and(
                eq(_status, NESTED_STATE.SHOW),
                not(clockRunning(springClock3))
            ),
            onEnd: set(_status, NESTED_STATE.UNDETERMINED)
        }),

        // sping panel to hide when status is HIDE
        springValue({
            _trans: _panelTrans,
            _velocity,
            toValue: hidePos,
            springClock: springClock4,
            whenSpring: and(
                eq(_status, NESTED_STATE.HIDE),
                not(clockRunning(springClock4))
            ),
            onEnd: [
                set(_status, NESTED_STATE.UNDETERMINED),
                hideCallback && call([], hideCallback)
            ]
        }),
        limitPanel
    ]);

    return <Animated.View style={{ transform: [{ translateX }] }} />;
};

HandleAnimated = React.memo(HandleAnimated);

let HandleMergePanelAnimated = ({
    _contentTrans,
    _isPanPanel,
    _pos,
    _tapState,
    mergePanelItems
}) => (
    <Animated.View
        style={{
            transform: [
                {
                    translateX: block([
                        checkOnMergePanel({
                            _contentTrans,
                            _isPanPanel,
                            _pos,
                            _tapState,
                            mergePanelItems
                        }),
                        0
                    ])
                }
            ]
        }}
    />
);

HandleMergePanelAnimated = React.memo(HandleMergePanelAnimated);

const wrapContent = ({
    children,
    mergePanelItems,
    setMergeItems,
    _contentTrans
}) => {
    const content = [];
    React.Children.map(children, (child, index) => {
        const { y, height, onLayout } =
            mergePanelItems[index] || createLayout();
        if (child.props.mergeWithPanel) {
            const wrapLayoutComp = React.createElement(
                Animated.View,
                {
                    onLayout,
                    style: {
                        zIndex: 99999999999999999,
                        transform: [{ translateY: multiply(_contentTrans, -1) }]
                    }
                },
                child
            );

            content.push(wrapLayoutComp);

            if (!mergePanelItems[index]) {
                setMergeItems((state) =>
                    produce(state, (draft) => {
                        draft[index] = { y, height, onLayout };
                    })
                );
            }
        } else {
            content.push(child);
        }
    });

    return content;
};

const NestedScrollView = (
    {
        stylePanel,
        styleContent,
        children,
        _panelTrans: _p,
        _contentTrans: _c,
        listFooterComponent,
        hideCallback
    },
    ref
) => {
    const [_contentTrans] = useState(() => _c || new Value(0));
    const [_isPanPanel] = useState(() => new Value(0));
    const [_status] = useState(() => new Value(NESTED_STATE.UNDETERMINED));
    const [_panelTrans] = useState(() => _p || new Value(0));
    const [mergePanelItems, setMergeItems] = useState({});

    const [{ height: heightPanel, onLayout: onLayoutPanel }] = useState(() =>
        createLayout()
    );
    const [
        { height: heightContent, onLayout: onLayoutContent }
    ] = useState(() => createLayout());

    const [
        [onGestureEvent, { _gesture, _state: _panState, _velocity }]
    ] = useState(() => createPanEvent(GESTURE_AXIS.Y_AXIS));

    const [[onTapEvent, { _state: _tapState, _pos }]] = useState(() =>
        createPanEvent(GESTURE_AXIS.Y_AXIS)
    );

    const checkMergePanelAnimater = React.createElement(
        HandleMergePanelAnimated,
        {
            _contentTrans,
            _isPanPanel,
            _pos,
            _tapState,
            mergePanelItems
        }
    );
    const animater = React.createElement(HandleAnimated, {
        _contentTrans,
        _gesture,
        _isPanPanel,
        _panState,
        _panelTrans,
        _status,
        _tapState,
        _velocity,
        heightContent,
        heightPanel,
        hideCallback
    });

    useImperativeHandle(ref, () => ({
        show: () => _status.setValue(NESTED_STATE.SHOW),
        hide: () => _status.setValue(NESTED_STATE.HIDE),
        reset: () => {
            _contentTrans.setValue(0);
        }
    }));

    return (
        <Animated.View
            onLayout={onLayoutPanel}
            pointerEvents="box-none"
            style={[
                styles.container,
                stylePanel,
                {
                    transform: [{ translateY: _panelTrans }]
                }
            ]}
        >
            {animater}
            {checkMergePanelAnimater}
            <PanGestureHandler
                minDist={10}
                failOffsetX={[-10, 10]}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onGestureEvent}
            >
                <Animated.View
                    style={[
                        styleContent,
                        {
                            transform: [{ translateY: _contentTrans }]
                        }
                    ]}
                >
                    <TapGestureHandler
                        onGestureEvent={onTapEvent}
                        onHandlerStateChange={onTapEvent}
                    >
                        <Animated.View onLayout={onLayoutContent}>
                            {wrapContent({
                                children,
                                mergePanelItems,
                                setMergeItems,
                                _contentTrans
                            })}
                        </Animated.View>
                    </TapGestureHandler>
                </Animated.View>
            </PanGestureHandler>
            {listFooterComponent && listFooterComponent()}
        </Animated.View>
    );
};

export default forwardRef(NestedScrollView);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden'
    }
});
