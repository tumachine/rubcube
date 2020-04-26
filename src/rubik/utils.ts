/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';

export enum sides {
  l = 0,

  r = 1,

  u = 2,

  d = 3,

  f = 4,

  b = 5,
}

export const sidesArr = [sides.l, sides.r, sides.u, sides.d, sides.f, sides.b];

export enum colors {
  green = 0,

  blue = 1,

  orange = 2,

  red = 3,

  white = 4,

  yellow = 5,
}

// hashes for correctly identifying color combinations on a cube
export const colorHashes: Array<number> = [1, 10, 100, 1000, 10000, 100000];
