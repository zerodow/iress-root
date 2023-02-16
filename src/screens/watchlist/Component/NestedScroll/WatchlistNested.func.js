import _ from 'lodash';

import Animated from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';

const {
    Value,
    add,
    and,
    block,
    clockRunning,
    cond,
    decay,
    eq,
    greaterThan,
    lessThan,
    multiply,
    neq,
    or,
    set,
    startClock,
    stopClock,
    sub,
    spring
} = Animated;

export const calculateOffset = ({ _panState, _gesture }) => {
    const _prevGesture = new Value(0);
    const _offset = new Value(0);
    return block([
        set(_offset, 0),
        cond(
            eq(_panState, State.BEGAN),
            [set(_prevGesture, _gesture)],
            [
                set(_offset, sub(_gesture, _prevGesture)),
                set(_prevGesture, _gesture)
            ]
        ),
        _offset
    ]);
};

export const checkOnMergePanel = ({
    _contentTrans,
    _isPanPanel,
    _pos,
    _tapState,
    mergePanelItems
}) =>
    cond(eq(_tapState, State.BEGAN), [
        set(_isPanPanel, 0),
        _.map(mergePanelItems, ({ y, height }) =>
            cond(
                and(
                    greaterThan(add(_pos, _contentTrans), y),
                    lessThan(add(_pos, _contentTrans), add(y, height))
                ), // on merge panel
                set(_isPanPanel, 1)
            )
        )
    ]);

export const createLayout = (_ref) => {
    const posContent = new Value(0);
    const heightContent = new Value(0);
    let onLayout = ({
        nativeEvent: {
            layout: { y, height }
        }
    }) => {
        posContent.setValue(y);
        heightContent.setValue(height);
    };
    if (_ref) {
        onLayout = () => {
            setTimeout(() => {
                _ref.current &&
                    _ref.current.getNode &&
                    _ref.current.getNode().measure &&
                    _ref.current.getNode().measure((x, y, width, height) => {
                        console.info(height);
                        posContent.setValue(y);
                        heightContent.setValue(height);
                    });
            }, 1000);
        };
    }

    return {
        y: posContent,
        height: heightContent,
        onLayout
    };
};

export const decayContent = ({
    whenDecay,
    _contentTrans,
    _panState,
    _velocity,
    decayClock
}) => {
    const _fromBegin = new Value(0);

    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    const config = { deceleration: 0.997 };

    return cond(
        whenDecay,
        [
            cond(clockRunning(decayClock), 0, [
                cond(_fromBegin, 0, [
                    set(_fromBegin, 1),
                    set(state.finished, 0),
                    set(state.velocity, _velocity),
                    set(state.position, _contentTrans),
                    set(state.time, 0),
                    startClock(decayClock)
                ])
            ]),
            cond(clockRunning(decayClock), decay(decayClock, state, config)),
            cond(state.finished, [stopClock(decayClock)]),

            set(_contentTrans, state.position),
            set(_velocity, state.velocity)
        ],
        [
            stopClock(decayClock),
            cond(eq(_panState, State.BEGAN), [set(_fromBegin, 0)])
        ]
    );
};

export const springValue = ({
    _trans,
    _velocity,
    whenSpring,
    springClock,
    toValue = 0,
    onEnd
}) => {
    const state = {
        finished: new Value(1),
        position: new Value(0),
        time: new Value(0),
        velocity: new Value(0)
    };

    const config = {
        stiffness: new Value(150),
        mass: new Value(1.1),
        damping: new Value(33),
        overshootClamping: true,
        restSpeedThreshold: 0.5,
        restDisplacementThreshold: 0.5,
        toValue: new Value(0)
    };

    const snapTo = (from, to, _v) => [
        set(state.finished, 0),
        set(state.position, from),
        set(state.time, 0),
        set(state.velocity, _v),
        set(config.toValue, to)
    ];

    return block([
        cond(whenSpring, [
            snapTo(_trans, toValue, _velocity),
            startClock(springClock)
        ]),
        cond(and(state.finished, clockRunning(springClock)), [
            stopClock(springClock),
            onEnd
        ]),
        spring(springClock, state, config),
        cond(clockRunning(springClock), [
            set(_velocity, state.velocity),
            set(_trans, state.position)
        ])
    ]);
};

export const stopAllClock = ({ whenStop, handle, arrClock }) => {
    const arrAnimator = _.map(arrClock, (item) => stopClock(item));
    return cond(whenStop, [arrAnimator, handle]);
};

export const transWithGesture = ({
    _contentTrans,
    _isPanPanel,
    _offset,
    _panState,
    _panelTrans
}) => {
    const moving = eq(_panState, State.ACTIVE);
    const nextContentPos = add(_contentTrans, _offset);
    const isMovePanel = or(
        greaterThan(nextContentPos, 0),
        greaterThan(_panelTrans, 0)
    );
    const moveContent = set(_contentTrans, nextContentPos);
    const resetContent = cond(neq(_contentTrans, 0), set(_contentTrans, 0));

    const nextPanelPos = add(_panelTrans, _offset);
    const movePanel = set(_panelTrans, nextPanelPos);

    // when velocity is high content diff 0 when switch to change panel

    return cond(
        // switch trans when content up to top
        moving,
        cond(_isPanPanel, movePanel, [
            cond(isMovePanel, [movePanel, resetContent], moveContent)
        ])
    );
};

export const transWithBounce = (_offset, whenBounce) =>
    cond(whenBounce, set(_offset, multiply(_offset, 0.5)));
