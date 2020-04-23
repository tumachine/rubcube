// import * as THREE from 'three';
import * as THREE from '../node_modules/three/src/Three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import RubikView from './rubik/view';
import RubikModel from './rubik/model';
import SolveStandardRubik from './rubik/solutions/solveStandardRubik';
import SolveWhiteCenterRubik from './rubik/solutions/solveWhiteCenterRubik'
import SolveYellowCenterRubik from './rubik/solutions/solveYellowCenterRubik';
import SolveBlueCenterRubik from './rubik/solutions/solveBlueCenterRubik';
import SolveYellowMiddleLineRubik from './rubik/solutions/solveYellowMiddleLineRubik';
import SolveRedCenterRubik from './rubik/solutions/solveRedCenterRubik';
import { sides } from './rubik/utils';
import SolveGreenOrangeCenterRubik from './rubik/solutions/solveGreenOrangeCenterRubik';
import SolveEdgesRubik from './rubik/solutions/solveEdgesRubik';
import SolveEvenRubikParities from './rubik/solutions/solveEvenRubikParities';

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

  rubikView: RubikView

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

  createRubik(length: number) {
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

    this.rubikView = new RubikView(rubikModel);
    this.rubikView.rubik.name = 'rubik';

    this.scene.add(this.rubikView.rubik);
    // this.rubikView.placeTextOnRubik();
    this.rubikView.colorizeRubik();
    console.log(`created rubik of size: ${length}`);
  }

  scrambleRubik(moves: number) {
    if (this.rubikView.rubikModel.sideLength > 3) {
      this.rubikView.rubikModel.generateRandomMoves(moves, true);
    } else {
      this.rubikView.rubikModel.generateRandomMoves(moves);
    }
    // this.rubikView.translateGeneratedMoves();
    this.rubikView.startNextMove();
    // this.rubikView.colorizeRubik();
  }

  solveRubik(animate = true) {
    if (this.rubikView.rubikModel.sideLength === 3) {
      // this.rubikView.rubikModel.solve();
      const solveStandardRubik = new SolveStandardRubik(this.rubikView.rubikModel);
      solveStandardRubik.solve();
      // this.rubikView.rubikModel
    } else {
      const solveWhiteCenterRubik = new SolveWhiteCenterRubik(this.rubikView.rubikModel);
      solveWhiteCenterRubik.solve();

      if (this.rubikView.rubikModel.sideLength % 2 !== 0) {
        const solveYellowMiddleLineRubik = new SolveYellowMiddleLineRubik(this.rubikView.rubikModel);
        solveYellowMiddleLineRubik.solve();
      }

      const solveYellowCenterRubik = new SolveYellowCenterRubik(this.rubikView.rubikModel);
      solveYellowCenterRubik.solve();
      const solveBlueCenterRubik = new SolveBlueCenterRubik(this.rubikView.rubikModel);
      solveBlueCenterRubik.solve();
      const solveRedCenterRubik = new SolveRedCenterRubik(this.rubikView.rubikModel);
      solveRedCenterRubik.solve();
      const solveGreenOrangeCenterRubik = new SolveGreenOrangeCenterRubik(this.rubikView.rubikModel);
      solveGreenOrangeCenterRubik.solve();
      const solveEdgesRubik = new SolveEdgesRubik(this.rubikView.rubikModel);
      solveEdgesRubik.solve();
      const solveStandardRubik = new SolveStandardRubik(this.rubikView.rubikModel);
      solveStandardRubik.solve();

      if (this.rubikView.rubikModel.sideLength % 2 === 0) {
        const solveEvenRubikParities = new SolveEvenRubikParities(this.rubikView.rubikModel);
        solveEvenRubikParities.solve();
      }
    }

    if (animate) {
      // this.rubikView.translateGeneratedMoves();
      this.rubikView.startNextMove();
    } else {
      // this.rubikView.placeTextOnRubik();
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

  render = () => {
    if (this.resizeRendererToDisplaySize()) {
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

  test() {
    const length = 4;
    const rubikModel = new RubikModel(length);

    this.camera.position.set(length * 1.5, length * 1.2, length * 2);
    this.camera.far = length * 4;
    this.camera.updateProjectionMatrix();
    // // this.camera.lookAt(this.controls.target);

    // // this.controls.enabled = true;

    this.rubikView = new RubikView(rubikModel);
    this.rubikView.rubik.name = 'rubik';

    this.scene.add(this.rubikView.rubik);
    // // this.rubikView.placeTextOnRubik();

    this.rubikView.rubikModel.generateRandomMoves(50, true);
    // this.rubikView.rubikModel.solveBigCube();
    const solveWhiteCenterRubik = new SolveWhiteCenterRubik(this.rubikView.rubikModel);
    solveWhiteCenterRubik.solve();

    if (this.rubikView.rubikModel.sideLength % 2 !== 0) {
      const solveYellowMiddleLineRubik = new SolveYellowMiddleLineRubik(this.rubikView.rubikModel);
      solveYellowMiddleLineRubik.solve();
    }

    const solveYellowCenterRubik = new SolveYellowCenterRubik(this.rubikView.rubikModel);
    solveYellowCenterRubik.solve();
    const solveBlueCenterRubik = new SolveBlueCenterRubik(this.rubikView.rubikModel);
    solveBlueCenterRubik.solve();
    const solveRedCenterRubik = new SolveRedCenterRubik(this.rubikView.rubikModel);
    solveRedCenterRubik.solve();
    const solveGreenOrangeCenterRubik = new SolveGreenOrangeCenterRubik(this.rubikView.rubikModel);
    solveGreenOrangeCenterRubik.solve();
    const solveEdgesRubik = new SolveEdgesRubik(this.rubikView.rubikModel);
    solveEdgesRubik.solve();
    const solveStandardRubik = new SolveStandardRubik(this.rubikView.rubikModel);
    solveStandardRubik.solve();
    const solveEvenRubikParities = new SolveEvenRubikParities(this.rubikView.rubikModel);
    solveEvenRubikParities.solve();

    this.rubikView.colorizeRubik();
    // this.rubikView.placeTextOnRubik();
  }
}
const main = new MainScene();

let size = 3;


window.onload = () => {
  const t0 = performance.now();
  main.test();
  const t1 = performance.now();
  console.log('Took', (t1 - t0).toFixed(4), 'milliseconds to generate');
  // const sizeUp = document.getElementById('sizeUp');
  // const sizeDown = document.getElementById('sizeDown');
  // const scramble = document.getElementById('scramble');
  // const solve = document.getElementById('solve');
  // sizeUp.onclick = () => {
  //   size += 1;
  //   main.createRubik(size);
  // };
  // sizeDown.onclick = () => {
  //   if (size > 3) {
  //     console.log(size);
  //     size -= 1;
  //     main.createRubik(size);
  //   }
  // };
  // scramble.onclick = () => {
  //   main.scrambleRubik(70);
  // };
  // solve.onclick = () => {
  //   main.solveRubik(true);
  // };
  // main.createRubik(3);
  main.render();
};


// function init() {
//   main.createRubik(3);
//   main.render();
// }

// init();
