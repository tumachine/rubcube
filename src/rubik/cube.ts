/* eslint-disable max-classes-per-file */
/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import { Side, getTextTexture, rotateSide } from './utils';
import { Vector3, Euler } from '../../node_modules/three/src/Three';

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

const planeTexture = new THREE.TextureLoader().load(require('../textures/cube.jpg'));

planeTexture.anisotropy = 4;
const planeMaterial = new THREE.MeshPhongMaterial({ map: planeTexture });
const planeGeometry = new THREE.PlaneBufferGeometry(1, 1);


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

export class CubePlane {
  public object: THREE.Object3D

  public baseMesh: THREE.Mesh

  public outerMesh: THREE.Mesh

  public textMesh: THREE.Mesh

  public originalPosition: THREE.Vector3

  public originalRotation: THREE.Euler

  constructor(x: number, y: number, z: number, side: number) {
    this.object = new THREE.Object3D();
    this.object.position.set(x, y, z);
    rotateSide(side, this.object);

    this.originalPosition = this.object.position.clone();
    this.originalRotation = this.object.rotation.clone();
  }

  createMesh(detach: number = 0) {
    this.baseMesh = createPlaneMesh();
    // rotateSide(faceSide, baseMesh, detach, 0);
    this.object.add(this.baseMesh);
    this.baseMesh.position.z += detach;
  }

  createOuterMesh(detach: number) {
    // rotateSide(faceSide, baseMesh, detach, 0);
    this.outerMesh = createPlaneMesh();
    this.object.add(this.outerMesh);
    this.outerMesh.position.z += detach;
    // this.outerMesh.rotation.z += Math.PI;
    // this.outerMesh.rotateZ(Math.PI);
    this.outerMesh.rotation.x = Math.PI;
  }

  createTextMesh(detach: number = 0.05) {
    this.textMesh = getTextMesh();
    this.object.add(this.textMesh);
    this.textMesh.position.z += detach;
  }

  resetPosition = () => {
    this.object.position.copy(this.originalPosition);
    this.object.rotation.copy(this.originalRotation);
  }

  setCustomColor(color: number) {
    (this.baseMesh.material as THREE.MeshPhongMaterial).color.set(color);
  }

  setColor(color: number) {
    (this.baseMesh.material as THREE.MeshPhongMaterial).color.set(colors[color]);
  }

  setOuterColor(color: number) {
    (this.outerMesh.material as THREE.MeshPhongMaterial).color.set(colors[color]);
  }

  setText(text: string) {
    const texture = getTextTexture(text);
    (this.textMesh.material as THREE.MeshBasicMaterial).map = texture;
  }

  disposeBase() {
    if (this.baseMesh !== undefined) {
      (this.baseMesh.material as THREE.MeshPhongMaterial).dispose();
      this.baseMesh.geometry.dispose();
      this.object.remove(this.baseMesh);
    }
  }

  disposeOuter() {
    if (this.outerMesh !== undefined) {
      (this.outerMesh.material as THREE.MeshPhongMaterial).dispose();
      this.outerMesh.geometry.dispose();
      this.object.remove(this.outerMesh);
    }
  }

  disposeText() {
    if (this.textMesh !== undefined) {
      (this.textMesh.material as THREE.MeshBasicMaterial).map.dispose();
      (this.textMesh.material as THREE.MeshBasicMaterial).dispose();
      this.textMesh.geometry.dispose();
      this.object.remove(this.textMesh);
    }
  }

  dispose() {
    this.disposeBase();
    this.disposeOuter();
    this.disposeText();
  }
}

export class Cube {
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
    // sidesOrientaion[faceSide](baseMesh, detach, 0);
    rotateSide(faceSide, baseMesh, detach, 0);
    this.baseMeshes[faceSide] = baseMesh;
    this.cube.add(baseMesh);
  }

  createOuterMeshes(faceSide: number, detach: number) {
    const outerMesh = createPlaneMesh();
    rotateSide(faceSide, outerMesh, detach, 180);
    this.outerMeshes[faceSide] = outerMesh;
    this.cube.add(outerMesh);
  }

  createTextMeshes(faceSide: number, detach: number = 0.05) {
    const mesh = getTextMesh();
    rotateSide(faceSide, mesh, detach, 0);
    this.textMeshes[faceSide] = mesh;
    this.cube.add(mesh);
  }

  resetPosition = () => {
    this.cube.position.copy(this.originalPosition);
    this.cube.rotation.copy(this.originalRotation);
  }

  setCustomColor(faceSide: number, color: number) {
    const mesh = this.baseMeshes[faceSide];
    (mesh.material as THREE.MeshPhongMaterial).color.set(color);
  }

  setColor(faceSide: number, color: number) {
    const mesh = this.baseMeshes[faceSide];
    (mesh.material as THREE.MeshPhongMaterial).color.set(colors[color]);
  }

  setOuterColor(faceSide: number, color: number) {
    const mesh = this.outerMeshes[faceSide];
    (mesh.material as THREE.MeshPhongMaterial).color.set(colors[color]);
  }

  setText(faceSide: number, text: string) {
    const texture = getTextTexture(text);
    const mesh = this.textMeshes[faceSide];
    (mesh.material as THREE.MeshBasicMaterial).map = texture;
  }

  disposeBase() {
    for (let i = 0; i < 6; i += 1) {
      if (this.baseMeshes[i] !== undefined) {
        (this.baseMeshes[i].material as THREE.MeshPhongMaterial).dispose();
        this.baseMeshes[i].geometry.dispose();
        this.cube.remove(this.baseMeshes[i]);
      }
    }
  }

  disposeOuter() {
    for (let i = 0; i < 6; i += 1) {
      if (this.outerMeshes[i] !== undefined) {
        (this.outerMeshes[i].material as THREE.MeshPhongMaterial).dispose();
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
