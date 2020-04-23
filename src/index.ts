// import * as THREE from 'three';
import * as THREE from '../node_modules/three/src/Three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import RubikManager from './rubik/rubikManager';

function createLight() {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  // light.position.set(-1, 2, 4)
  return light;
}

function createCamera() {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return camera;
}

class MainScene {
  light: THREE.DirectionalLight

  canvas: HTMLCanvasElement

  renderer: THREE.WebGLRenderer

  camera: THREE.PerspectiveCamera

  controls: OrbitControls

  scene: THREE.Scene

  rubikManager: RubikManager;

  constructor() {
    this.light = createLight();
    this.canvas = document.querySelector('#c');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

    this.camera = createCamera();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.camera.position.z = 10;
    this.controls.update();
    // camera.position.set(0, 50, 0)
    // camera.up.set(0, 0, 1)
    // camera.lookAt(0, 0, 0)

    this.scene = new THREE.Scene();

    this.scene.add(this.light);
  }

  addRubik(rubikManager: RubikManager) {
    this.rubikManager = rubikManager;
    this.rubikManager.addToScene(this.scene);
    this.rubikManager.adjustCameraToRubik(this.camera);
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

    if (this.rubikManager !== null) {
      this.rubikManager.render();
    }

    this.controls.update();
    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}

const test = true;

window.onload = () => {
  let size = 3;
  let rubikManager = new RubikManager(size);

  const main = new MainScene();

  if (test) {
    rubikManager = new RubikManager(20);
    rubikManager.scramble(400);

    const t0 = performance.now();
    rubikManager.solve();
    const t1 = performance.now();
    console.log('Took', (t1 - t0).toFixed(4), 'milliseconds to solve');

    rubikManager.colorize();
  } else {
    rubikManager = new RubikManager(size);
    rubikManager.colorize();
  }

  main.addRubik(rubikManager);


  const sizeUp = document.getElementById('sizeUp');
  const sizeDown = document.getElementById('sizeDown');
  const scramble = document.getElementById('scramble');
  const solve = document.getElementById('solve');

  sizeUp.onclick = () => {
    size += 1;
    rubikManager = new RubikManager(size);
    main.addRubik(rubikManager);
    rubikManager.colorize();
  };

  sizeDown.onclick = () => {
    if (size > 3) {
      console.log(size);
      size -= 1;
      rubikManager = new RubikManager(size);
      main.addRubik(rubikManager);
      rubikManager.colorize();
    }
  };

  scramble.onclick = () => {
    rubikManager.scramble(70);
    rubikManager.animate();
  };

  solve.onclick = () => {
    rubikManager.solve();
    rubikManager.animate();
  };

  main.render();
};
