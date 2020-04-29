/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import { sides, sidesOrientaion, getTextTexture, getTextMesh, createMesh } from './utils';
import { Vector3, Euler } from '../../node_modules/three/src/Three';
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

export default class Cube {
  boxMaterial: THREE.MeshPhongMaterial

  boxGeometry: THREE.BoxGeometry

  box: THREE.Mesh;

  cube: THREE.Object3D

  baseMeshes: THREE.Mesh[]

  outerMeshes: THREE.Mesh[]

  textMeshes: THREE.Mesh[]

  originalPosition: THREE.Vector3

  originalRotation: THREE.Euler

  constructor(x: number, y: number, z: number) {
    this.cube = new THREE.Object3D();
    this.cube.position.set(x, y, z);
    this.originalPosition = new Vector3(x, y, z);
    this.originalRotation = new Euler(this.cube.rotation.x, this.cube.rotation.y, this.cube.rotation.z);

    this.baseMeshes = new Array(6);
    this.outerMeshes = new Array(6);
    this.textMeshes = new Array(6);
  }

  createMeshes(faceSide: number, detach: number = 0) {
    const baseMesh = createMesh(boxWidth, boxHeight);
    sidesOrientaion[faceSide](baseMesh, detach, 0);
    this.baseMeshes[faceSide] = baseMesh;
    this.cube.add(baseMesh);
  }

  createOuterMeshes(faceSide: number, detach: number) {
    const outerMesh = createMesh(boxWidth, boxHeight);
    sidesOrientaion[faceSide](outerMesh, detach, 180);
    this.outerMeshes[faceSide] = outerMesh;
    this.cube.add(outerMesh);
  }

  createTextMeshes(faceSide: number, detach: number = 0.05) {
    const mesh = getTextMesh();
    sidesOrientaion[faceSide](mesh, detach, 0);
    this.textMeshes[faceSide] = mesh;
    this.cube.add(mesh);
  }

  resetPosition = () => {
    this.cube.position.set(this.originalPosition.x, this.originalPosition.y, this.originalPosition.z);
    this.cube.rotation.set(this.originalRotation.x, this.originalRotation.y, this.originalRotation.z);
  }

  setColor(faceSide: number, color: number) {
    const mesh = this.baseMeshes[faceSide];
    (mesh.material as THREE.MeshBasicMaterial).color.set(colors[color]);
  }

  setOuterColor(faceSide: number, color: number) {
    const mesh = this.outerMeshes[faceSide];
    (mesh.material as THREE.MeshBasicMaterial).color.set(colors[color]);
  }

  setText(faceSide: number, text: string) {
    const texture = getTextTexture(text);
    const mesh = this.textMeshes[faceSide];
    (mesh.material as THREE.MeshBasicMaterial).map = texture;
  }

  getCube() {
    return this.cube;
  }
}
