import { SceneObject } from './SceneObject';

export interface addObject {
  (sceneObj: SceneObject, index: number): void;
}

export interface removeObject {
  (obj: SceneObject): void;
}

export interface Jump {
  (index: number): void,
}
