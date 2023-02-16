import React from 'react';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import { BATCH, MAX_LOADING, TOTAL_DURATIONS, DURATIONS } from './';
import { snapTo2 } from '~s/watchlist/Component/NestedScroll/handleFunc';

const {
    Value,
    block,
    and,
    or,
    cond,
    call,
    divide,
    sub,
    set,
    add,
    Clock,
    clockRunning,
    startClock,
    stopClock,
    not,
    greaterThan,
    lessThan,
    neq,
    abs,
    eq,
    floor,
    max,
    interpolate,
    debug,
    diff
} = Animated;

// #region useVelocity
export const useVelocity = (_scrollValue) => {
    const _velocity = new Value(0);
    const timer = new Clock();
    const diffScroll = new Value(0);
    const diffTimer = new Value(0);
    const preTimer = new Value(0);
    const _preScroll = new Value(0);
    const countStop = new Value(0);

    const hadMove = and(neq(diff(_scrollValue), 0), not(clockRunning(timer)));

    const noMove = and(eq(diffScroll, 0), clockRunning(timer));

    const hadDiff = or(diffScroll, diffTimer);
    const calVelo = divide(diffScroll, diffTimer);

    return [
        _velocity,
        block([
            cond(greaterThan(sub(timer, preTimer), 50), [
                set(diffTimer, sub(timer, preTimer)),
                set(diffScroll, sub(_scrollValue, _preScroll)),
                cond(hadDiff, set(_velocity, calVelo)),
                // debug('diffScroll', diffScroll),
                set(preTimer, timer),
                set(_preScroll, _scrollValue)
            ]),
            cond(hadMove, [startClock(timer)]),
            cond(noMove, set(countStop, add(countStop, 1))),
            cond(greaterThan(countStop, 13), [
                set(_velocity, 0),
                set(countStop, 0),
                stopClock(timer)
            ])
        ])
    ];
};
// #endregion

// #region  useBatch
const useBatchOnce = ({ _scrollValue, _heightRow, _velocity, onChange }) => {
    // firstIndex
    const firstIndex = floor(sub(divide(_scrollValue, _heightRow), 1));
    const handleMinFirstIndex = max(firstIndex, 0);

    // lastIndex
    const lastIndex = floor(add(divide(_scrollValue, _heightRow), BATCH + 1));
    // const handleMaxLastIndex = min(size, lastIndex);
    const handleMaxLastIndex = lastIndex;

    const _firstIndex = new Value(0);
    const _lastIndex = new Value(MAX_LOADING);

    const _firstDiff = new Value(0);
    const _lastDiff = new Value(0);

    return [
        _firstIndex,
        _lastIndex,
        block([
            cond(and(_heightRow), [
                cond(neq(_firstIndex, handleMinFirstIndex), [
                    set(_firstDiff, 1),
                    set(_firstIndex, handleMinFirstIndex)
                ]),
                cond(neq(_lastIndex, handleMaxLastIndex), [
                    set(_lastDiff, 1),
                    set(_lastIndex, handleMaxLastIndex)
                ])
            ]),

            // handle change

            cond(
                and(lessThan(abs(_velocity), 0.3), or(_firstDiff, _lastDiff)),
                [
                    set(_firstDiff, 0),
                    set(_lastDiff, 0),
                    call([_firstIndex, _lastIndex], onChange)
                ]
            )
        ])
    ];
};

export const useBatch = (props) => {
    const [[_firstIndex, _lastIndex, batchBlock]] = React.useState(() =>
        useBatchOnce(props)
    );

    return [_firstIndex, _lastIndex, batchBlock];
};
// #endregion

// #region userTimer

const userTimerOnce = (onEnd) => {
    const _endTag = new Value(0);
    const _timming = new Value(0);
    return [
        _endTag,
        _timming,
        cond(
            _endTag,
            [],
            [
                snapTo2(TOTAL_DURATIONS, _timming, TOTAL_DURATIONS),
                cond(eq(_timming, TOTAL_DURATIONS), [
                    set(_endTag, 1),
                    call([], onEnd)
                ])
            ]
        )
    ];
};

export const userTimer = (onEnd) => {
    const [[_endTag, _timming, timerBlock]] = React.useState(() =>
        userTimerOnce(onEnd)
    );

    return [_endTag, _timming, timerBlock];
};

// #endregion

export const AnimatedItem = ({ _timming, index, children, onLayout }) => {
    const delayItems = _.floor(TOTAL_DURATIONS / MAX_LOADING);
    const startTime = delayItems * index;
    const endTime = _.min([startTime + DURATIONS, TOTAL_DURATIONS]);

    return (
        <Animated.View
            onLayout={onLayout}
            style={{
                opacity: interpolate(_timming, {
                    inputRange: [0, startTime, endTime, TOTAL_DURATIONS],
                    outputRange: [0, 0, 1, 1]
                })
            }}
        >
            {children}
        </Animated.View>
    );
};

const BlockAnimated = (props) => <Animated.Code exec={block(props.exec)} />;

export default React.memo(
    BlockAnimated,
    ({ checkValue: oldCheck }, { checkValue: newCheck }) => {
        let check = true;
        _.map(oldCheck, (item, index) => {
            check = check && _.isEqual(item, newCheck[index]);
        });

        return check;
    }
);
