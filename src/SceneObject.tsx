import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import THREE, { PerspectiveCamera } from 'three';


export interface MouseEventObject {
  e: MouseEvent,
  camera: THREE.PerspectiveCamera,
  mouse: THREE.Vector3,
  controls: OrbitControls,
}

export abstract class SceneObject {
  object: THREE.Object3D

  abstract controlCamera(camera: PerspectiveCamera): void;

  abstract dispose(): void;

  abstract render(): void;

  abstract onMouseMove(me: MouseEventObject): void;

  abstract onMouseDown(me: MouseEventObject): void;

  abstract onMouseUp(me: MouseEventObject): void;
}
