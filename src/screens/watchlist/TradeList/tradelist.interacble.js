import Animated from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';

const STATE_INTERACTABLE = {
    UNDETERMINED: 0,
    START: 1,
    STOP: 2
};

const {
    add,
    cond,
    diff,
    divide,
    eq,
    exp,
    lessThan,
    greaterThan,
    and,
    call,
    block,
    multiply,
    pow,
    set,
    abs,
    clockRunning,
    greaterOrEq,
    lessOrEq,
    sqrt,
    startClock,
    stopClock,
    sub,
    Clock,
    Value,
    debug,
    neq
} = Animated;

const ANIMATOR_PAUSE_CONSECUTIVE_FRAMES = 10;
const ANIMATOR_PAUSE_ZERO_VELOCITY = 1;
const DEFAULT_SNAP_TENSION = 300;
const DEFAULT_SNAP_DAMPING = 0.7;
const DEFAULT_GRAVITY_STRENGTH = 400;
const DEFAULT_GRAVITY_FALLOF = 40;

export const useTrans = (_translate, horizontal) => {
    let transform = [{ translateX: _translate }];

    if (!horizontal) {
        transform = [{ translateY: _translate }];
    }

    return transform;
};

const permBuckets = [[], [], []];
// #region interactable function
const sq = (x) => {
    return multiply(x, x);
};

const influenceAreaWithRadius = (radius, anchor) => {
    return {
        left: (anchor.x || 0) - radius,
        right: (anchor.x || 0) + radius,
        top: (anchor.y || 0) - radius,
        bottom: (anchor.y || 0) + radius
    };
};

const snapTo = (target, snapPoints, best, clb, dragClb, isSibling) => {
    const dist = new Value(0);
    const curPointIndex = new Value(0);
    let prePointIndex = new Value(0);
    snapPoints.map((pt, index) => {
        if (pt.x === 0) {
            prePointIndex = new Value(index);
        }
    });
    const snap = (pt) => [
        set(best.tension, pt.tension || DEFAULT_SNAP_TENSION),
        set(best.damping, pt.damping || DEFAULT_SNAP_DAMPING),
        set(best.x, pt.x || 0),
        set(best.y, pt.y || 0)
    ];
    const snapDist = (pt) =>
        add(sq(sub(target.x, pt.x || 0)), sq(sub(target.y, pt.y || 0)));
    return [
        set(dist, snapDist(snapPoints[0])),
        ...snap(snapPoints[0]),
        isSibling && set(curPointIndex, 0),
        ...snapPoints.map((pt, index) => {
            const newDist = snapDist(pt);
            return cond(lessThan(newDist, dist), [
                set(dist, newDist),
                isSibling && set(curPointIndex, index),
                ...snap(pt)
            ]);
        }),
        ...snapPoints.map((pt, index) => {
            return cond(
                greaterThan(curPointIndex, prePointIndex),
                cond(eq(prePointIndex, index - 1), [
                    ...snap(pt),
                    set(prePointIndex, index),
                    set(curPointIndex, index)
                ]),
                cond(
                    eq(curPointIndex, prePointIndex),
                    [],
                    cond(eq(prePointIndex, index + 1), [
                        ...snap(pt),
                        set(prePointIndex, index)
                    ])
                )
            );
        }),
        (clb || dragClb) &&
            call([best.x, best.y, target.x, target.y], ([bx, by, x, y]) => {
                snapPoints.forEach((pt, index) => {
                    if (
                        (pt.x === undefined || pt.x === bx) &&
                        (pt.y === undefined || pt.y === by)
                    ) {
                        clb && clb({ nativeEvent: { ...pt, index } });
                        dragClb &&
                            dragClb({
                                nativeEvent: {
                                    x,
                                    y,
                                    targetSnapPointId: pt.id,
                                    state: 'end'
                                }
                            });
                    }
                });
            })
    ];
};

const springBehavior = (dt, target, obj, anchor, tension = 300) => {
    const dx = sub(target.x, anchor.x);
    const ax = divide(multiply(-1, tension, dx), obj.mass);
    const dy = sub(target.y, anchor.y);
    const ay = divide(multiply(-1, tension, dy), obj.mass);
    return {
        x: set(obj.vx, add(obj.vx, multiply(dt, ax))),
        y: set(obj.vy, add(obj.vy, multiply(dt, ay)))
    };
};

const frictionBehavior = (dt, target, obj, damping = 0.7) => {
    const friction = pow(damping, multiply(60, dt));
    return {
        x: set(obj.vx, multiply(obj.vx, friction)),
        y: set(obj.vy, multiply(obj.vy, friction))
    };
};

const anchorBehavior = (dt, target, obj, anchor) => {
    const dx = sub(anchor.x, target.x);
    const dy = sub(anchor.y, target.y);
    return {
        x: set(obj.vx, divide(dx, dt)),
        y: set(obj.vy, divide(dy, dt))
    };
};

const gravityBehavior = (
    dt,
    target,
    obj,
    anchor,
    strength = DEFAULT_GRAVITY_STRENGTH,
    falloff = DEFAULT_GRAVITY_FALLOF
) => {
    const dx = sub(target.x, anchor.x);
    const dy = sub(target.y, anchor.y);
    const drsq = add(sq(dx), sq(dy));
    const dr = sqrt(drsq);
    const a = divide(
        multiply(
            -1,
            strength,
            dr,
            exp(divide(multiply(-0.5, drsq), sq(falloff)))
        ),
        obj.mass
    );
    const div = divide(a, dr);
    return {
        x: cond(dr, set(obj.vx, add(obj.vx, multiply(dt, dx, div)))),
        y: cond(dr, set(obj.vy, add(obj.vy, multiply(dt, dy, div))))
    };
};

const bounceBehavior = (dt, target, obj, area, bounce = 0) => {
    const xnodes = [];
    const ynodes = [];
    const flipx = set(obj.vx, multiply(-1, obj.vx, bounce));
    const flipy = set(obj.vy, multiply(-1, obj.vy, bounce));
    if (area.left !== undefined) {
        xnodes.push(
            cond(and(eq(target.x, area.left), lessThan(obj.vx, 0)), flipx)
        );
    }
    if (area.right !== undefined) {
        xnodes.push(
            cond(and(eq(target.x, area.right), lessThan(0, obj.vx)), flipx)
        );
    }
    if (area.top !== undefined) {
        xnodes.push(
            cond(and(eq(target.y, area.top), lessThan(obj.vy, 0)), flipy)
        );
    }
    if (area.bottom !== undefined) {
        xnodes.push(
            cond(and(eq(target.y, area.bottom), lessThan(0, obj.vy)), flipy)
        );
    }
    return {
        x: xnodes,
        y: ynodes
    };
};

const withInfluence = (area, target, behavior) => {
    if (!area) {
        return behavior;
    }
    const testLeft = area.left === undefined || lessOrEq(area.left, target.x);
    const testRight =
        area.right === undefined || lessOrEq(target.x, area.right);
    const testTop = area.top === undefined || lessOrEq(area.top, target.y);
    const testBottom =
        area.bottom === undefined || lessOrEq(target.y, area.bottom);
    const testNodes = [testLeft, testRight, testTop, testBottom].filter(
        (t) => t !== true
    );
    const test = and(...testNodes);
    return {
        x: cond(test, behavior.x),
        y: cond(test, behavior.y)
    };
};

const withLimits = (value, lowerBound, upperBound) => {
    let result = value;
    if (lowerBound !== undefined) {
        result = cond(lessThan(value, lowerBound), lowerBound, result);
    }
    if (upperBound !== undefined) {
        result = cond(lessThan(upperBound, value), upperBound, result);
    }
    return result;
};

// #endregion

// #region interactable constructor function
const addSpring = (
    anchor,
    tension,
    influence,
    buckets = permBuckets,
    target,
    dt,
    obj
) => {
    buckets[0].push(
        withInfluence(
            influence,
            target,
            springBehavior(dt, target, obj, anchor, tension)
        )
    );
};

const addFriction = (
    damping,
    influence,
    buckets = permBuckets,
    target,
    dt,
    obj
) => {
    buckets[1].push(
        withInfluence(
            influence,
            target,
            frictionBehavior(dt, target, obj, damping)
        )
    );
};

const addGravity = (
    anchor,
    strength,
    falloff,
    influence,
    buckets = permBuckets
) => {
    buckets[0].push(
        withInfluence(
            influence,
            target,
            gravityBehavior(dt, target, obj, anchor, strength, falloff)
        )
    );
};

const sortBuckets = (specialBuckets) => ({
    x: specialBuckets
        .map((b, idx) => [...permBuckets[idx], ...b].reverse().map((b) => b.x))
        .reduce((acc, b) => acc.concat(b), []),
    y: specialBuckets
        .map((b, idx) => [...permBuckets[idx], ...b].reverse().map((b) => b.y))
        .reduce((acc, b) => acc.concat(b), [])
});

// #endregion

const useDrag = (target, dragAnchor, dt, obj, dragWithSpring) => {
    const dragBuckets = [[], [], []];
    if (dragWithSpring) {
        const { tension, damping } = dragWithSpring;
        addSpring(dragAnchor, tension, null, dragBuckets, target, dt, obj);
        addFriction(damping, null, dragBuckets, target, dt, obj);
    } else {
        dragBuckets[0].push(anchorBehavior(dt, target, obj, dragAnchor));
    }

    return dragBuckets;
};

export const useInteracble = (
    _gesture,
    _state,
    _reset,
    axis,
    vaxis,
    {
        onDrag,
        onSnap,
        onStop,
        dragToss = 0.1,
        snapPoints,
        isSibling = true,
        animatedValueX,
        animatedValueY
    }
) => {
    // #region constructor
    const resetWithSnap = new Value(STATE_INTERACTABLE.UNDETERMINED);

    const target = {
        x: new Value(0),
        y: new Value(0)
    };

    const update = {
        x: animatedValueX,
        y: animatedValueY
    };

    const clock = new Clock();

    const dt = divide(diff(clock), 1000);

    const obj = {
        vx: new Value(0),
        vy: new Value(0),
        mass: 1
    };

    const tossedTarget = {
        x: add(target.x, multiply(dragToss, obj.vx)),
        y: add(target.y, multiply(dragToss, obj.vy))
    };

    const dragAnchor = { x: new Value(0), y: new Value(0) };
    const dragBuckets = useDrag(target, dragAnchor, dt, obj);

    const handleStartDrag =
        onDrag &&
        call([target.x, target.y], ([x, y]) =>
            onDrag({ nativeEvent: { x, y, state: 'start' } })
        );

    const snapBuckets = [[], [], []];
    const snapAnchor = {
        x: new Value(0),
        y: new Value(0),
        tension: new Value(DEFAULT_SNAP_TENSION),
        damping: new Value(DEFAULT_SNAP_DAMPING)
    };

    const updateSnapTo = snapTo(
        tossedTarget,
        snapPoints,
        snapAnchor,
        onSnap,
        onDrag,
        isSibling
    );

    addSpring(
        snapAnchor,
        snapAnchor.tension,
        null,
        snapBuckets,
        target,
        dt,
        obj
    );
    addFriction(snapAnchor.damping, null, snapBuckets, target, dt, obj);

    const dragBehaviors = sortBuckets(dragBuckets);
    const snapBehaviors = sortBuckets(snapBuckets);

    const noMovementFrames = {
        x: new Value(ANIMATOR_PAUSE_CONSECUTIVE_FRAMES + 1),
        y: new Value(ANIMATOR_PAUSE_CONSECUTIVE_FRAMES + 1)
    };

    const stopWhenNeeded = cond(
        and(
            greaterOrEq(noMovementFrames.x, ANIMATOR_PAUSE_CONSECUTIVE_FRAMES),
            greaterOrEq(noMovementFrames.y, ANIMATOR_PAUSE_CONSECUTIVE_FRAMES)
        ),
        [
            onStop
                ? cond(
                      clockRunning(clock),
                      call([target.x, target.y], ([x, y]) =>
                          onStop({ nativeEvent: { x, y } })
                      )
                  )
                : undefined,
            stopClock(clock)
        ],
        startClock(clock)
    );

    // #endregion

    const _dragging = new Value(0);
    const _start = new Value(0);
    const _x = target[axis];
    const _vx = obj[vaxis];
    const _anchor = dragAnchor[axis];

    let advance = cond(
        lessThan(abs(_vx), ANIMATOR_PAUSE_ZERO_VELOCITY),
        _x,
        add(_x, multiply(_vx, dt))
    );

    const last = new Value(Number.MAX_SAFE_INTEGER);
    const noMoveFrameCount = noMovementFrames[axis];
    const testMovementFrames = cond(
        eq(advance, last),
        set(noMoveFrameCount, add(noMoveFrameCount, 1)),
        [set(last, advance), set(noMoveFrameCount, 0)]
    );

    const testMovementFrames2 = cond(
        eq(resetWithSnap, STATE_INTERACTABLE.START),
        [
            set(last, advance),
            set(noMoveFrameCount, 0),
            set(resetWithSnap, STATE_INTERACTABLE.UNDETERMINED)
        ]
    );

    const step = cond(
        eq(_state, State.ACTIVE),
        [
            cond(_dragging, 0, [
                handleStartDrag,
                startClock(clock),
                set(_dragging, 1),
                set(_start, _x)
            ]),
            set(_anchor, add(_start, _gesture)),
            cond(dt, dragBehaviors[axis])
        ],
        [
            cond(clockRunning(clock), 0, startClock(clock)),
            cond(_dragging, [updateSnapTo, set(_dragging, 0)]),
            cond(dt, snapBehaviors[axis]),
            testMovementFrames,
            testMovementFrames2,
            stopWhenNeeded
        ]
    );

    // export some values to be available for imperative commands
    // this._dragging[axis] = _dragging;
    // this._velocity[axis] = _vx;

    // update animatedValueX/animatedValueY
    const doUpdateAnReturn = update[axis] ? set(update[axis], _x) : _x;

    const onSnapTo = ({ index, tension, damping }) => {
        const snapPoint = snapPoints[index];
        snapAnchor.tension.setValue(
            tension || snapPoint.tension || DEFAULT_SNAP_TENSION
        );
        snapAnchor.damping.setValue(
            damping || snapPoint.damping || DEFAULT_SNAP_DAMPING
        );
        snapAnchor.x.setValue(snapPoint.x || 0);
        snapAnchor.y.setValue(snapPoint.y || 0);
        resetWithSnap.setValue(STATE_INTERACTABLE.START);
        onSnap && onSnap({ nativeEvent: { ...snapPoint, index } });
    };

    const handleReset =
        _reset &&
        cond(diff(_reset), [
            set(snapAnchor.x, 0),
            set(snapAnchor.y, 0),
            set(_x, 0)
        ]);

    return [
        block([step, set(_x, advance), handleReset, doUpdateAnReturn]),
        onSnapTo
    ];
};
