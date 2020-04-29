import { planeOrientation } from './rubik/utils';

export interface RenderInterface {
    rubik: THREE.Object3D;
    raycastMeshes: THREE.Mesh[];
    calculateCubeOnFace(side: string, point: THREE.Vector3): void;
    selectedOrientation: planeOrientation;
    rotateWithMouse(direction: THREE.Vector3);
    rotate(direction: THREE.Vector3);
    stopRotation(): void;
    mouseLargest: string;
    name: string;
    render();
}

export interface ChangeSceneInterface {
    addToScene(scene: THREE.Scene);
    changeCamera(camera: THREE.PerspectiveCamera);
}

export interface MainScene {
  addRenderer(renderObj: RenderInterface, indexOn: number);
  addToScene(renderObj: ChangeSceneInterface);
  changeCamera(renderObj: ChangeSceneInterface);
}
