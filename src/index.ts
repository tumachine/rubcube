// import * as THREE from 'three';
import * as THREE from '../node_modules/three/src/Three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderInterface, ChangeSceneInterface } from './d';
import RubikManager from './rubik/manager';
import { MathUtils, Vector3, Vector2 } from '../node_modules/three/src/Three';
import { planeOrientation } from './rubik/utils';

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

  raycaster: THREE.Raycaster

  mouse: THREE.Vector3

  mouseIsDown: boolean;

  positionOnMouseDown: THREE.Vector3

  positionOnMouseUp: THREE.Vector3

  clickedOnFace: boolean

  distanceTrigger: number = 0.2

  lastMousePosition: Vector3

  rotating: boolean

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

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector3();
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);

    document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);

    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

    this.clickedOnFace = false;
  }

  updateMousePosition = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX / rect.width) * 2 - 1;
    this.mouse.y = -(event.clientY / rect.height) * 2 + 1;
  }

  // if (side === sides.l || side === sides.r) {
  //   vector = new THREE.Vector2(z, y);
  // } else if (side === sides.u || side === sides.d) {
  //   vector = new THREE.Vector2(x, z);
  // } else if (side === sides.f || side === sides.b) {
  //   vector = new THREE.Vector2(x, y);
  // }

  getMousePosition = (mouse: Vector3, plane: planeOrientation = planeOrientation.XY): THREE.Vector3 => {
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position[plane] / dir[plane];
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
  }


  onDocumentMouseMove(event: MouseEvent) {
    this.updateMousePosition(event);
    if (this.mouseIsDown) {
      const mousePosition = this.mouse.clone();

      let mPosDown = this.getMousePosition(this.positionOnMouseDown);
      let mPos = this.getMousePosition(mousePosition);

      if (this.rotating) {
      //   this.clickedOnFace = false;

        const orientation = this.renderObjects[0].selectedOrientation;
        const mPosLast = this.getMousePosition(this.lastMousePosition, orientation);
        mPos = this.getMousePosition(mousePosition, orientation);
        // const dir = mPos.sub(mPosLast).normalize();
        const dir = mPos.sub(mPosLast);

        const { mouseLargest } = this.renderObjects[0];
        this.renderObjects[0].rotate(dir);

        this.lastMousePosition = this.mouse.clone();

      } else if (this.clickedOnFace) {
        const distance = mPos.sub(mPosDown).distanceTo(new Vector3(0, 0, 0));
        if (distance >= this.distanceTrigger) {
          console.log('TRIGGER');

          const orientation = this.renderObjects[0].selectedOrientation;
          mPosDown = this.getMousePosition(this.positionOnMouseDown, orientation);
          mPos = this.getMousePosition(mousePosition, orientation);
          const dir = mPos.sub(mPosDown);
          this.renderObjects[0].rotateWithMouse(dir);

          this.clickedOnFace = false;

          this.lastMousePosition = this.mouse.clone();
          this.rotating = true;
        }
      }
    }
  }

  onDocumentMouseUp(event: MouseEvent) {
    console.log('detect mouse up');
    event.preventDefault();
    this.mouseIsDown = false;

    if (this.rotating) {
      this.renderObjects[0].stopRotation();
      this.rotating = false;
    }

    this.updateMousePosition(event);

    this.controls.enabled = true;
  }

  onDocumentMouseDown(event: MouseEvent) {
    event.preventDefault();

    this.mouseIsDown = true;

    this.updateMousePosition(event);

    this.positionOnMouseDown = this.mouse.clone();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.renderObjects[0].raycastMeshes);
    if (intersects.length > 0) {
      this.clickedOnFace = true;
      this.controls.enabled = false;
      const intersection = intersects[0];
      const obj = intersection.object as THREE.Mesh;
      const { point } = intersection;
      this.renderObjects[0].calculateCubeOnFace(obj.name, point);


      // console.log(`Clicked: ${name}`);
      // console.log(`Point: ${intersects[0].point.x} ${intersects[0].point.y} ${intersects[0].point.z}`);
    }
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

  const historyButtons = document.getElementById('buttonHistory') as HTMLDivElement;
  const moves = document.getElementById('moves') as HTMLDivElement;
  const rotation = document.getElementById('rotation') as HTMLDivElement;

  const rubikManager = new RubikManager(main, historyButtons, moves, rotation);

  const sizeUp = document.getElementById('sizeUp') as HTMLButtonElement;
  const sizeDown = document.getElementById('sizeDown') as HTMLButtonElement;
  const scramble = document.getElementById('scramble') as HTMLButtonElement;
  const solve = document.getElementById('solve') as HTMLButtonElement;
  const prev = document.getElementById('prev') as HTMLButtonElement;
  const next = document.getElementById('next') as HTMLButtonElement;
  const rotate = document.getElementById('rotate') as HTMLButtonElement;

  rotate.onclick = () => {
    rubikManager.rotateCurrentOrientation();
  };

  sizeUp.onclick = () => {
    rubikManager.sizeUp();
  };

  sizeDown.onclick = () => {
    rubikManager.sizeDown();
  };

  scramble.onclick = () => {
    rubikManager.scramble();
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
