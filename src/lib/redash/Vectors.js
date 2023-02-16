import Animated from 'react-native-reanimated';

import { clamp as clamp1 } from './Math';

const { Value, block } = Animated;
// type Dimension = 'x' | 'y';
// type Fn = (...args: Animated.Adaptable<number>[]) => Animated.Node<number>;
// type Adaptable = Vector | Animated.Adaptable<number>;
// type SingleArgOp<T extends Adaptable = Adaptable> = [T];
// type BinArgOp<T extends Adaptable = Adaptable> = [T, T, ...T[]];

// export interface Vector<
//   T extends Animated.Adaptable<number> = Animated.Adaptable<number>
// > {
//   x: T;
//   y: T;
// }

// type Create = {
//   (): Vector<0>;
//   <T extends Animated.Adaptable<number>>(x: T, y?: T): Vector<T>;
// };

const create = (
  x,
  y
) => ({
  x: 0,
  y: 0
});

const createValue = (x = 0, y) =>
  create(new Value(x), new Value(y));

const isAdaptable = (value) =>
  typeof value === 'number' ||
  value instanceof Animated.Node ||
  value instanceof Animated.Value;

const get = (vectors, dimension) =>
  vectors.map((vector) => (isAdaptable(vector) ? vector : vector[dimension]));

const apply = (fn, ...vectors) => ({
  x: fn(...get(vectors, 'x')),
  y: fn(...get(vectors, 'y'))
});

const add = (...vectors) => apply(Animated.add, ...vectors);
const sub = (...vectors) => apply(Animated.sub, ...vectors);
const div = (...vectors) => apply(Animated.divide, ...vectors);
const mul = (...vectors) => apply(Animated.multiply, ...vectors);
const pow = (...vectors) =>
  apply(Animated.pow, ...vectors);
const sqrt = (...vectors) => apply(Animated.sqrt, ...vectors);
const cos = (...vectors) => apply(Animated.cos, ...vectors);
const sin = (...vectors) => apply(Animated.sin, ...vectors);
const min = (vector, value) =>
  apply(Animated.min, vector, value);
const max = (vector, value) =>
  apply(Animated.max, vector, value);
const clamp = (value, minVec, maxVec) =>
  apply(clamp1, value, minVec, maxVec);

const minus = (a) => mul(-1, a);

const set = (a, b) =>
  block([
    Animated.set(a.x, isAdaptable(b) ? b : b.x),
    Animated.set(a.y, isAdaptable(b) ? b : b.y)
  ]);

const length = (v) =>
  Animated.sqrt(Animated.add(Animated.pow(v.x, 2), Animated.pow(v.y, 2)));
const normalize = (v) => div(v, length(v));
const dot = (v1, v2) =>
  add(Animated.multiply(v1.x, v2.x), Animated.multiply(v1.y, v2.y));
const cross = (v1, v2) =>
  sub(Animated.multiply(v1.x, v2.y), Animated.multiply(v1.y, v2.x));

export const vec = {
  create,
  createValue,
  minus,
  add,
  sub,
  dot,
  div,
  mul,
  multiply: mul,
  divide: div,
  pow,
  sqrt,
  set,
  clamp,
  apply,
  min,
  max,
  cos,
  sin,
  length,
  normalize,
  cross
};
