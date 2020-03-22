import * as THREE from 'three';

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

export default class Cube {
  material: THREE.MeshPhongMaterial
  geometry: THREE.BoxGeometry
  cube: THREE.Mesh

  constructor(x, y, z) {
    this.material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, vertexColors: THREE.FaceColors });
    this.geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.set(x, y, z);
  }

  setColor(faceSide, color) {
    this.geometry.faces[faceSide].color.setHex(colors[color]);
    this.geometry.faces[faceSide + 1].color.setHex(colors[color]);
  }

  getCube() {
    return this.cube;
  }
}
