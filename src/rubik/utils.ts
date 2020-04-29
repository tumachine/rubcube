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

export enum planeOrientation {
  XY = 'z',
  ZY = 'x',
  XZ = 'y',
}

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

interface MeshSideOrient {
  (mesh: THREE.Mesh, detach: number, rotation: number);
}

export const sidesOrientaion: MeshSideOrient[] = new Array(6);

sidesOrientaion[sides.f] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateZ(0.5 + detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.b] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateZ(-0.5 - detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.l] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateX(-0.5 - detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.r] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateX(0.5 + detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.u] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateY(0.5 + detach);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 180);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};
sidesOrientaion[sides.d] = (mesh: THREE.Mesh, detach: number = 0, rotation: number = 0) => {
  mesh.translateY(-0.5 - detach);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * rotation);
};

export const createMesh = (boxWidth: number, boxHeight: number) => {
  const material = new THREE.MeshBasicMaterial();

  const mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(boxWidth, boxHeight),
    material,
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

export const getTextMesh = (): THREE.Mesh => {
  // const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  material.transparent = true;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material,
  );
  return mesh;
};

// hashes for correctly identifying color combinations on a cube
export const colorHashes: Array<number> = [1, 10, 100, 1000, 10000, 100000];
