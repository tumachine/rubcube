export interface RenderInterface {
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
