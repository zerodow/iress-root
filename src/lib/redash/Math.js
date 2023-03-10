import Animated from 'react-native-reanimated';

const {
    eq,
    set,
    cond,
    atan,
    add,
    multiply,
    lessThan,
    abs,
    divide,
    sub,
    min: min2,
    max: max2,
    round: reRound,
    greaterThan,
    pow,
    and,
    greaterOrEq,
    lessOrEq,
    proc,
    floor
} = Animated;

export const bin = (value) => (value ? 1 : 0);

export const fract = (x) => sub(x, floor(x));

export const sign = (x) =>
    cond(lessThan(x, 0), -1, cond(eq(x, 0), 0, 1));

export const min = (...args) =>
    args.reduce((acc, arg) => min2(acc, arg));

export const max = (...args) =>
    args.reduce((acc, arg) => max2(acc, arg));

export const minus = (x) => multiply(-1, x);

export const avg = (
    ...v
) => divide(add(...v), v.length);

export const clamp = (
    value,
    lowerBound,
    upperBound
) => min2(max2(lowerBound, value), upperBound);

export const between = (
    value,
    lowerBound,
    upperBound,
    inclusive = true
) => {
    if (inclusive) {
        return and(greaterOrEq(value, lowerBound), lessOrEq(value, upperBound));
    }
    return and(greaterThan(value, lowerBound), lessThan(value, upperBound));
};

export const approximates = (
    a,
    b,
    precision = 0.001
) => lessThan(abs(sub(a, b)), precision);

export const toRad = (deg) => multiply(deg, Math.PI / 180);

export const toDeg = (rad) => multiply(rad, 180 / Math.PI);

// https://en.wikipedia.org/wiki/Atan2
// https://www.gamedev.net/forums/topic/441464-manually-implementing-atan2-or-atan/
// https://developer.download.nvidia.com/cg/atan2.html
// https://www.medcalc.org/manual/atan2_function.php
export const atan2 = (y, x) => {
    const a = atan(divide(y, x));
    const { PI } = Math;
    return cond(
        greaterThan(x, 0),
        a,
        cond(
            and(lessThan(x, 0), greaterOrEq(y, 0)),
            add(a, PI),
            cond(
                and(lessThan(x, 0), lessThan(y, 0)),
                sub(a, PI),
                cond(
                    and(eq(x, 0), greaterThan(y, 0)),
                    PI / 2,
                    cond(and(eq(x, 0), lessThan(y, 0)), -PI / 2, 0)
                )
            )
        )
    );
};

export const cubicBezier = (
    t,
    p0,
    p1,
    p2,
    p3
) => {
    const term = sub(1, t);
    const a = multiply(1, pow(term, 3), pow(t, 0), p0);
    const b = multiply(3, pow(term, 2), pow(t, 1), p1);
    const c = multiply(3, pow(term, 1), pow(t, 2), p2);
    const d = multiply(1, pow(term, 0), pow(t, 3), p3);
    return add(a, b, c, d);
};

export const round = (
    value,
    precision = 0
) => {
    const p = pow(10, precision);
    return divide(reRound(multiply(value, p)), p);
};

export const inc = (value) => set(value, add(value, 1));

export const dec = (value) => set(value, sub(value, 1));
