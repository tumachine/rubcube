import * as THREE from 'three';
import { Side, rotateSide } from './utils';
import { MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry } from 'three';

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

const getTextMesh = () => {
  return new THREE.Mesh(
    textGeometry,
    textMaterial.clone(),
  );
};

const textureRotations: Function[] = new Array(6);
textureRotations[Side.l] = (mesh: THREE.Mesh) => {
  // do nothing
};
textureRotations[Side.r] = (mesh: THREE.Mesh) => {
  mesh.rotation.y = Math.PI;
};
textureRotations[Side.u] = (mesh: THREE.Mesh) => {
  mesh.rotation.x = Math.PI;
};
textureRotations[Side.d] = (mesh: THREE.Mesh) => {
  // do nothing
};
textureRotations[Side.f] = (mesh: THREE.Mesh) => {
  // do nothing
};
textureRotations[Side.b] = (mesh: THREE.Mesh) => {
  mesh.rotation.y = Math.PI;
};

export default class CubePlane {
  public object: THREE.Object3D

  public baseMesh: THREE.Mesh<PlaneGeometry, MeshPhongMaterial> | null = null;

  public outerMesh: THREE.Mesh<PlaneGeometry, MeshPhongMaterial> | null = null;

  public imageMesh: THREE.Mesh<PlaneGeometry, MeshBasicMaterial> | null = null;

  public originalPosition: THREE.Vector3

  public originalRotation: THREE.Euler

  public originalSide: number

  public originalDirection: number

  constructor(x: number, y: number, z: number, side: number, direction: number) {
    this.object = new THREE.Object3D();
    this.object.position.set(x, y, z);
    rotateSide(side, this.object);

    this.originalSide = side;
    this.originalDirection = direction;
    this.originalPosition = this.object.position.clone();
    this.originalRotation = this.object.rotation.clone();
  }

  createMesh(detach: number = 0) {
    this.baseMesh = createPlaneMesh();
    this.object.add(this.baseMesh);
    this.baseMesh.position.z += detach;
  }

  createOuterMesh(detach: number) {
    this.outerMesh = createPlaneMesh();
    this.object.add(this.outerMesh);
    this.outerMesh.position.z += detach;
    this.outerMesh.rotation.x = Math.PI;
  }

  createImageMesh(detach: number = 0.01) {
    this.imageMesh = getTextMesh();
    this.object.add(this.imageMesh);
    this.imageMesh.position.z += detach;
    textureRotations[this.originalSide](this.imageMesh);
  }

  resetPosition = () => {
    this.object.position.copy(this.originalPosition);
    this.object.rotation.copy(this.originalRotation);
  }

  setCustomColor(color: number | string | THREE.Color) {
    this.baseMesh?.material.color.set(color);
  }

  setColor(color: number) {
    this.baseMesh?.material.color.set(colors[color]);
  }

  setOuterColor(color: number) {
    this.outerMesh?.material.color.set(colors[color]);
  }

  setImage(image: THREE.Texture) {
    if (this.imageMesh) {
      this.imageMesh.material.map = image;
    }
  }

  disposeBase() {
    if (this.baseMesh) {
      this.baseMesh.material.dispose();
      this.baseMesh.geometry.dispose();
      this.object.remove(this.baseMesh);
    }
  }

  disposeOuter() {
    if (this.outerMesh) {
      this.outerMesh.material.dispose();
      this.outerMesh.geometry.dispose();
      this.object.remove(this.outerMesh);
    }
  }

  disposeImage() {
    if (this.imageMesh) {
      this.imageMesh.material.dispose();
      this.imageMesh.geometry.dispose();
      this.object.remove(this.imageMesh);
    }
  }

  dispose() {
    this.disposeBase();
    this.disposeOuter();
    this.disposeImage();
  }
}
