// import * as THREE from 'three';
import * as THREE from '../node_modules/three/src/Three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderInterface, ChangeSceneInterface } from './d';
import RubikManager from './rubik/manager';

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

  renderObjects: RenderInterface[]

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

    this.renderObjects = [];
  }

  // make it so, addition of an element would always push an array
  // modification of an element, only allowed if names are the same
  addRenderer(renderObj: RenderInterface, indexOn: number = null) {
    if (indexOn !== null) {
      // update value
      if (this.renderObjects.length < indexOn + 1) {
        for (let i = 0; i < indexOn + 1; i += 1) {
          this.renderObjects.push(null);
          if (this.renderObjects.length === indexOn + 1) {
            break;
          }
        }
        this.renderObjects[indexOn] = renderObj;
      } else if (this.renderObjects[indexOn].name === renderObj.name) {
        this.renderObjects[indexOn] = renderObj;
      } else {
        console.log('Incorrect addition of a render object');
      }
    } else {
      this.renderObjects.push(renderObj);
    }
    console.log(this.renderObjects);
  }

  addToScene(renderObj: ChangeSceneInterface) {
    renderObj.addToScene(this.scene);
  }

  changeCamera(renderObj: ChangeSceneInterface) {
    renderObj.changeCamera(this.camera);
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


// objects render order

window.onload = () => {
  const main = new MainScene();
  const rubikManager = new RubikManager(main);

  const sizeUp = document.getElementById('sizeUp');
  const sizeDown = document.getElementById('sizeDown');
  const scramble = document.getElementById('scramble');
  const solve = document.getElementById('solve');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const historyButtons = document.getElementById('buttonHistory');

  sizeUp.onclick = () => {
    rubikManager.sizeUp();
  };

  sizeDown.onclick = () => {
    rubikManager.sizeDown();
  };

  scramble.onclick = () => {
    rubikManager.scramble();
    rubikManager.addButtons(historyButtons);
  };

  solve.onclick = () => {
    rubikManager.solve();
  };

  prev.onclick = () => {
    rubikManager.prev();
  };

  next.onclick = () => {
    rubikManager.next();
  };


  main.render();
};
