/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import { sides } from './utils';
// import { makeTextSprite } from './utils';
// import * as THREE from 'three';

const boxWidth = 0.95;
const boxHeight = 0.95;
const boxDepth = 0.95;

const blue = 0x0000FF;
const red = 0xFF0000;
const yellow = 0xFFFF00;
const green = 0x008000;
const white = 0xFFFFFF;
const orange = 0xFFA500;

const colors = [green, blue, orange, red, white, yellow];

interface MeshSideOrient {
  (mesh: THREE.Mesh, detach: number);
}

const sidesOrientaion: MeshSideOrient[] = new Array(6);

sidesOrientaion[sides.f] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateZ(0.5 + detach);
};
sidesOrientaion[sides.b] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateZ(-0.5 - detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
};
sidesOrientaion[sides.l] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateX(-0.5 - detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 180);
};
sidesOrientaion[sides.r] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateX(0.5 + detach);
  mesh.rotateY(THREE.MathUtils.DEG2RAD * 90);
};
sidesOrientaion[sides.u] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateY(0.5 + detach);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 180);
};
sidesOrientaion[sides.d] = (mesh: THREE.Mesh, detach: number = 0) => {
  mesh.translateY(-0.5 - detach);
  mesh.rotateX(THREE.MathUtils.DEG2RAD * 90);
};


export default class Cube {
  boxMaterial: THREE.MeshPhongMaterial

  boxGeometry: THREE.BoxGeometry

  box: THREE.Mesh;

  cube: THREE.Object3D

  // constructor(x: number, y: number, z: number) {
  //   this.cube = new THREE.Object3D();

  //   this.boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  //   this.boxMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, vertexColors: true });
  //   this.box = new THREE.Mesh(this.boxGeometry, this.boxMaterial);

  //   this.cube.add(this.box);

  //   this.cube.position.set(x, y, z);
  // }

  // setColor(faceSide: number, color: number) {
  //   this.boxGeometry.faces[faceSide].color.setHex(colors[color]);

  //   this.boxGeometry.faces[faceSide + 1].color.setHex(colors[color]);
  // }

  constructor(x: number, y: number, z: number) {
    this.cube = new THREE.Object3D();
    this.cube.position.set(x, y, z);
  }

  setColor(faceSide: number, color: number) {
    const material = new THREE.MeshBasicMaterial();
    material.color.set(colors[color]);
    // material.side = THREE.DoubleSide;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(boxWidth, boxHeight),
      // new THREE.PlaneGeometry(1, 1),
      material,
    );

    sidesOrientaion[faceSide](mesh, 0);

    this.cube.add(mesh);
  }

  getCube() {
    return this.cube;
  }

  addText(text: string, faceSide: number) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 256;

    context.font = 'Bold 120px Arial';
    context.fillStyle = 'rgba(0,0,0,0.95)';
    // context.fillStyle = 'rgba(255,255,255,0.95)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, 128, 128);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    material.transparent = true;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      material,
    );

    sidesOrientaion[faceSide](mesh, 0.05);

    this.cube.add(mesh);
  }
}
