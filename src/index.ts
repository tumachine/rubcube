// import * as THREE from 'three';
import * as THREE from '../node_modules/three/src/Three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
import { RenderInterface, MouseInterface } from './d';
import RubikManager from './rubik/manager';

export const createCamera = () => {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return camera;
};

function createLight() {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  // light.position.set(-1, 2, 4)
  return light;
}

class MainScene {
  light: THREE.DirectionalLight

  canvas: HTMLCanvasElement

  renderer: THREE.WebGLRenderer

  camera: THREE.PerspectiveCamera

  controls: OrbitControls

  scene: THREE.Scene

  renderObjects: RenderInterface[]

  mouseObjects: MouseInterface[]

  constructor() {
    this.scene = new THREE.Scene();

    this.camera = createCamera();
    const downLight = new THREE.HemisphereLight(0xffffff, 0x000088);
    downLight.position.set(-10, 10, 10);
    downLight.intensity = 0.7;
    // downLight.add(new THREE.AxesHelper(3));
    this.scene.add(downLight);

    const upLight = new THREE.HemisphereLight(0xffffff, 0x880000);
    upLight.position.set(10, -10, -10);
    upLight.intensity = 0.7;
    // upLight.add(new THREE.AxesHelper(3));
    this.scene.add(upLight);

    // this.light = new THREE.PointLight(0xffffff, 1, 100);
    this.light = new THREE.DirectionalLight(0xffffff, 0.4);
    this.scene.add(this.light);

    // this.scene.add(new THREE.HemisphereLight(0x443333, 0x222233, 4));

    this.canvas = document.querySelector('#c');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.update();

    // this.scene.background = new THREE.Color(0x3399ff);

    this.renderObjects = [];

    // const helper = new THREE.AxesHelper(5);
    // this.scene.add(helper);
  }

  resizeRendererToDisplaySize = () => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const needResize = this.canvas.width !== width || this.canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  render = () => {
    if (this.resizeRendererToDisplaySize()) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    for (let i = 0; i < this.renderObjects.length; i += 1) {
      if (this.renderObjects[i] !== null) {
        this.renderObjects[i].render();
      }
    }

    this.controls.update();
    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}

window.onload = () => {
  const main = new MainScene();

  const rubikManager = new RubikManager(main);

  main.render();
};

export default MainScene;
