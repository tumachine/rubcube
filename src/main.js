import * as THREE from '../someFolder/build/three.module.js';
import { OrbitControls } from '../someFolder/examples/jsm/controls/OrbitControls.js';
import RubikView from './rubikView.js';
import RubikModel from './rubikModel.js';
import { sides } from './variables.js';

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

class Main {
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

    this.objects = [];

    this.scene.add(this.light);
  }

  createRubik(length) {
    const rubikModel = new RubikModel(length);
    this.camera.position.z = length * 2;
    this.camera.far = length * 4;

    this.rubikView = new RubikView(rubikModel, this.scene);

    this.scene.add(this.rubikView.rubik);
  }

  colorize() {
    this.rubikView.colorizeRubik();
  }

  scrambleRubik(moves, sidesOnly = true) {
    this.rubikView.rubikModel.generateRandomMoves(moves, !sidesOnly);
  }

  solveRubik(standard = true, animate = true) {
    if (standard) {
      this.rubikView.rubikModel.solve();
    } else {
      this.rubikView.rubikModel.solveBigCube();
    }

    if (animate) {
      this.rubikView.translateGeneratedMoves();
      this.rubikView.startNextMove();
    } else {
      this.rubikView.colorizeRubik();
    }
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

  render = (time) => {
    time *= 0.001;
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.objects.forEach((obj) => {
    // obj.rotation.y = time
    });

    this.rubikView.render();

    this.controls.update();
    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}


function main() {
  const start = new Main();
  start.createRubik(7);
  start.colorize();
  // start.scrambleRubik(50, false);
  // start.solveRubik(false, true);
  start.render();
}

main();
