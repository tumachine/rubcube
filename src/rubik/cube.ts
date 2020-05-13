/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import { sides, sidesOrientaion, getTextTexture } from './utils';
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

const planeMaterial = new THREE.MeshLambertMaterial();
const planeGeometry = new THREE.PlaneBufferGeometry(boxWidth, boxHeight);

const createPlaneMesh = () => {
  const mesh = new THREE.Mesh(
    planeGeometry,
    planeMaterial.clone(),
  );
  return mesh;
};

const textMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
textMaterial.transparent = true;
const textGeometry = new THREE.PlaneGeometry(1, 1);

const getTextMesh = (): THREE.Mesh => {
  const mesh = new THREE.Mesh(
    textGeometry,
    textMaterial.clone(),
  );
  return mesh;
};


export default class Cube {
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
    const baseMesh = createPlaneMesh();
    sidesOrientaion[faceSide](baseMesh, detach, 0);
    this.baseMeshes[faceSide] = baseMesh;
    this.cube.add(baseMesh);
  }

  createOuterMeshes(faceSide: number, detach: number) {
    const outerMesh = createPlaneMesh();
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
    (mesh.material as THREE.MeshLambertMaterial).color.set(colors[color]);
  }

  setOuterColor(faceSide: number, color: number) {
    const mesh = this.outerMeshes[faceSide];
    (mesh.material as THREE.MeshLambertMaterial).color.set(colors[color]);
  }

  setText(faceSide: number, text: string) {
    const texture = getTextTexture(text);
    const mesh = this.textMeshes[faceSide];
    (mesh.material as THREE.MeshBasicMaterial).map = texture;
  }

  disposeBase() {
    for (let i = 0; i < 6; i += 1) {
      if (this.baseMeshes[i] !== undefined) {
        (this.baseMeshes[i].material as THREE.MeshLambertMaterial).dispose();
        this.baseMeshes[i].geometry.dispose();
        this.cube.remove(this.baseMeshes[i]);
      }
    }
  }

  disposeOuter() {
    for (let i = 0; i < 6; i += 1) {
      if (this.outerMeshes[i] !== undefined) {
        (this.outerMeshes[i].material as THREE.MeshLambertMaterial).dispose();
        this.outerMeshes[i].geometry.dispose();
        this.cube.remove(this.outerMeshes[i]);
      }
    }
  }

  disposeText() {
    for (let i = 0; i < 6; i += 1) {
      if (this.textMeshes[i] !== undefined) {
        (this.textMeshes[i].material as THREE.MeshBasicMaterial).map.dispose();
        (this.textMeshes[i].material as THREE.MeshBasicMaterial).dispose();
        this.textMeshes[i].geometry.dispose();
        this.cube.remove(this.textMeshes[i]);
      }
    }
  }

  dispose() {
    this.disposeBase();
    this.disposeOuter();
    this.disposeText();
  }

  getCube() {
    return this.cube;
  }
}
