/* eslint-disable max-len */
import * as THREE from 'three';
import { MathUtils } from 'three';

export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

export const randomColor = (): string => {
  const c = () => {
    const hex = Math.floor(Math.random() * 256).toString(16);
    return (`0${String(hex)}`).substr(-2); // pad with zero
  };
  return `#${c()}${c()}${c()}`;
};

export class Side {
  public static l: number = 0

  public static r: number = 1

  public static u: number = 2

  public static d: number = 3

  public static f: number = 4

  public static b: number = 5

  public static toString = (side: number) : string => Side.sidesStr[side];

  public static fromString = (side: string) : number => Side.sidesMap[side];

  public static getHash = (side: number) : number => Side.hashes[side];

  private static hashes: number[] = [1, 10, 100, 1000, 10000, 100000];

  private static sidesStr = ['L', 'R', 'U', 'D', 'F', 'B'];

  private static sidesMap: { [side: string]: number } = {
    L: Side.l,
    R: Side.r,
    U: Side.u,
    D: Side.d,
    F: Side.f,
    B: Side.b,
  };
}

export interface MoveHistory {
  side: number,
  slice: number | number[],
  clockwise: boolean,
}

export const moveToString = (side: number, slice: number, clockwise: boolean): string => {
  return `${Side.toString(side)}${clockwise ? '' : "'"}${slice === 0 ? '' : slice + 1}`;
};

export type Matrix = number[][];

interface MeshSideOrient {
  (object: THREE.Object3D, detach: number, rotation: number);
}

const sidesOrientaion: MeshSideOrient[] = new Array(6);
sidesOrientaion[Side.f] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateZ(0.5 + detach);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[Side.b] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateZ(-0.5 - detach);
  object.rotateY(Math.PI);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[Side.l] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateX(-0.5 - detach);
  object.rotateY((Math.PI / 2) * 3);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[Side.r] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateX(0.5 + detach);
  object.rotateY(Math.PI / 2);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[Side.u] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateY(0.5 + detach);
  object.rotateX((Math.PI / 2) * 3);
  object.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[Side.d] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateY(-0.5 - detach);
  // object.rotateY(Math.PI / 2);
  object.rotateX(MathUtils.DEG2RAD * 90);
  object.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};

export const rotateSide = (side: number, object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  sidesOrientaion[side](object, detach, rotation);
};


// make it more versatile
export const getTextTexture = (text: string): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 256;

  context.font = 'Bold 120px Arial';
  context.fillStyle = 'rgba(0,0,0,0.95)';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.fillText(text, 128, 128);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  return texture;
};

export const getLargestValue = (vec: THREE.Vector3): string => {
  const absX = Math.abs(vec.x);
  const absY = Math.abs(vec.y);
  const absZ = Math.abs(vec.z);
  if (absX > absY && absX > absZ) {
    return 'x';
  }

  if (absY > absX && absY > absZ) {
    return 'y';
  }

  return 'z';
};

export const getLargestIndex = (...arr: number[]) => {
  let largest: number = arr[0];
  let largestIndex: number = 0;

  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > largest) {
      largest = arr[i];
      largestIndex = i;
    }
  }
  return largestIndex;
}