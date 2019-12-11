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

class MainScene {
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
    if (this.scene.getObjectByName('rubik') !== undefined) {
      this.scene.remove(this.rubikView.rubik);
    }

    const rubikModel = new RubikModel(length);


    // this.controls.enabled = false;

    this.camera.position.set(length * 1.5, length * 1.2, length * 2);
    this.camera.far = length * 4;
    this.camera.updateProjectionMatrix();
    // this.camera.lookAt(this.controls.target);

    // this.controls.enabled = true;

    this.rubikView = new RubikView(rubikModel, this.scene);
    this.rubikView.rubik.name = 'rubik';

    this.scene.add(this.rubikView.rubik);
    this.rubikView.colorizeRubik();
  }

  scrambleRubik(moves) {
    if (this.rubikView.rubikModel.sideLength > 3) {
      this.rubikView.rubikModel.generateRandomMoves(moves, true);
    } else {
      this.rubikView.rubikModel.generateRandomMoves(moves);
    }
    this.rubikView.translateGeneratedMoves();
    this.rubikView.startNextMove();
  }

  solveRubik(animate = true) {
    if (this.rubikView.rubikModel.sideLength === 3) {
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

    this.rubikView.render();

    this.controls.update();
    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}
const main = new MainScene();

let size = 3;

window.onload = () => {
  const sizeUp = document.getElementById('sizeUp');
  const sizeDown = document.getElementById('sizeDown');
  const scramble = document.getElementById('scramble');
  const solve = document.getElementById('solve');
  sizeUp.onclick = () => {
    size += 2;
    main.createRubik(size);
  };
  sizeDown.onclick = () => {
    if (size > 3) {
      console.log(size)
      size -= 2;
      main.createRubik(size);
    }
  };
  scramble.onclick = () => {
    main.scrambleRubik(30);
  };
  solve.onclick = () => {
    main.solveRubik(true);
  };
};


function init() {
  main.createRubik(3);
  main.render();
}

init();
