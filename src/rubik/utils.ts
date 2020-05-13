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

export const sidesStr = ['L', 'R', 'U', 'D', 'F', 'B'];

export const sidesMap: { [side: string]: number } = {};
sidesMap.L = sides.l;
sidesMap.R = sides.r;
sidesMap.U = sides.u;
sidesMap.D = sides.d;
sidesMap.F = sides.f;
sidesMap.B = sides.b;

export enum colors {
  green = 0,

  blue = 1,

  orange = 2,

  red = 3,

  white = 4,

  yellow = 5,
}

export type Matrix = Array<Array<number>>;

export const createCamera = () => {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return camera;
};

interface MeshSideOrient {
  (object: THREE.Object3D, detach: number, rotation: number);
}

export const sidesOrientaion: MeshSideOrient[] = new Array(6);

// sidesOrientaion[sides.f] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateZ(0.5 + detach);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
// };
// sidesOrientaion[sides.b] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateZ(-0.5 - detach);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
// };
// sidesOrientaion[sides.l] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateX(-0.5 - detach);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
// };
// sidesOrientaion[sides.r] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateX(0.5 + detach);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
//   mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
// };
// sidesOrientaion[sides.u] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateY(0.5 + detach);
//   mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
//   mesh.rotateX(THREE.MathUtils.DEG2RAD * 180);
//   mesh.rotateX(THREE.MathUtils.DEG2RAD * rotation);
// };
// sidesOrientaion[sides.d] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
//   mesh.translateY(-0.5 - detach);
//   mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
//   mesh.rotateX(THREE.MathUtils.DEG2RAD * rotation);
// };

sidesOrientaion[sides.f] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateZ(0.5 + detach);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.b] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateZ(-0.5 - detach);
  object.rotateY(THREE.MathUtils.DEG2RAD * 180);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.l] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateX(-0.5 - detach);
  object.rotateY(THREE.MathUtils.DEG2RAD * 90);
  object.rotateY(THREE.MathUtils.DEG2RAD * 180);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.r] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateX(0.5 + detach);
  object.rotateY(THREE.MathUtils.DEG2RAD * 90);
  object.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.u] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateY(0.5 + detach);
  object.rotateX(THREE.MathUtils.DEG2RAD * 90);
  object.rotateX(THREE.MathUtils.DEG2RAD * 180);
  object.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.d] = (object: THREE.Object3D, detach: number = 0, rotation: number = 0) => {
  object.translateY(-0.5 - detach);
  object.rotateX(THREE.MathUtils.DEG2RAD * 90);
  object.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};

export const createMesh = (boxWidth: number, boxHeight: number) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(boxWidth, boxHeight),
    new THREE.MeshBasicMaterial(),
  );
  return mesh;
};

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

// make it so, addition of an element would always push an array
// modification of an element, only allowed if names are the same
// addRenderer(renderObj: RenderInterface, indexOn: number = null) {
//   if (indexOn !== null) {
//     // update value
//     if (this.renderObjects.length < indexOn + 1) {
//       for (let i = 0; i < indexOn + 1; i += 1) {
//         this.renderObjects.push(null);
//         if (this.renderObjects.length === indexOn + 1) {
//           break;
//         }
//       }
//       this.renderObjects[indexOn] = renderObj;
//     } else if (this.renderObjects[indexOn].name === renderObj.name) {
//       this.renderObjects[indexOn] = renderObj;
//     } else {
//       console.log('Incorrect addition of a render object');
//     }
//   } else {
//     this.renderObjects.push(renderObj);
//   }
//   console.log(this.renderObjects);
// }

// hashes for correctly identifying color combinations on a cube
export const colorHashes: Array<number> = [1, 10, 100, 1000, 10000, 100000];
