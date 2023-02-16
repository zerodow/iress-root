import Animated, { block, defined } from 'react-native-reanimated';

import { clamp, max, min } from './Math';

const {
    Value,
    set,
    add,
    multiply,
    cond,
    eq,
    abs,
    sub,
    not,
    lessThan,
    greaterThan,
    divide,
    modulo,
    proc
} = Animated;

// export type SpringConfig = Partial<Omit<Animated.SpringConfig, 'toValue'>>;
// export type TimingConfig = Partial<Omit<Animated.TimingConfig, 'toValue'>>;

export const mix = (
    value,
    x,
    y
) => add(x, multiply(value, sub(y, x)));

export const step = (value, edge) => lessThan(value, edge);

export const smoothstep = (
    value,
    edge0,
    edge1
) => {
    const t = clamp(divide(sub(value, edge0), sub(edge1, edge0)), 0, 1);
    return multiply(t, t, sub(3, multiply(2, t)));
};

// currently diffClamp() from reanimated seems currently buggy because of proc()
export const diff = (v) => {
    const stash = new Value(0);
    const prev = new Value();
    return block([
        set(stash, cond(defined(prev), sub(v, prev), 0)),
        set(prev, v),
        stash
    ]);
};

export const diffClamp = (
    a,
    minVal,
    maxVal
) => {
    const value = new Value();
    return set(
        value,
        min(max(add(cond(defined(value), value, a), diff(a)), minVal), maxVal)
    );
};

export const moving = (
    position,
    minPositionDelta = 1e-3,
    emptyFrameThreshold = 5
) => {
    const delta = diff(position);
    const noMovementFrames = new Value(0);
    return cond(
        lessThan(abs(delta), minPositionDelta),
        [
            set(noMovementFrames, add(noMovementFrames, 1)),
            not(greaterThan(noMovementFrames, emptyFrameThreshold))
        ],
        [set(noMovementFrames, 0), 1]
    );
};

export const snapPoint = (
    value,
    velocity,
    points
) => {
    const point = add(value, multiply(0.2, velocity));
    const diffPoint = (p) => abs(sub(point, p));
    const deltas = points.map((p) => diffPoint(p));
    const minDelta = min(...deltas);
    const result = points.reduce(
        (acc, p) => cond(eq(diffPoint(p), minDelta), p, acc),
        new Value()
    );
    return result
};

export const addTo =
    (value, node) =>
        set(value, add(value, node))
    ;

export const subTo =
    (value, node) =>
        set(value, sub(value, node))
    ;

export const multiplyTo =
    (value, node) =>
        set(value, multiply(value, node))
    ;

export const divideTo =
    (value, node) =>
        set(value, divide(value, node))
    ;

export const moduloTo = (value, node) => set(value, modulo(value, node))
