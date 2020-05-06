import TWEEN from 'tween.ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from '../../node_modules/three/src/Three';
import { sides } from '../rubik/utils';
import { Vector3, Object3D, MathUtils } from '../../node_modules/three/src/Three';
import MainScene from '..';

class CameraControls {
  private renderer: HTMLCanvasElement

  private pivotPoint: THREE.Object3D

  private scene: MainScene

  private objectPos: Vector3

  private controls: OrbitControls

  private cameras: THREE.PerspectiveCamera[]

  private rotatingCameras: THREE.PerspectiveCamera[]

  private cameraIndex: number

  private directions: Vector3[]

  private length: number

  private sideGet: Function[]

  private isRotating: boolean

  private testCounter = 0;

  public constructor(camera: THREE.PerspectiveCamera, renderer: HTMLCanvasElement, scene: MainScene) {
    this.renderer = renderer;
    this.scene = scene;
    this.length = 0;
    this.isRotating = false;

    this.pivotPoint = new THREE.Object3D();
    // this.scene.add(this.pivotPoint);

    this.generateCameraPositions();
    this.distanceObjects(5);

    this.createCameras();
    this.changeControls(0);

    this.sideGet = [
      () => this.getCameraAngle(-this.getCam().position.z, this.getCam().position.y),
      () => this.getCameraAngle(-this.getCam().position.y, this.getCam().position.z),
      () => this.getCameraAngle(-this.getCam().position.x, this.getCam().position.z),
      () => this.getCameraAngle(-this.getCam().position.z, this.getCam().position.x),
      () => this.getCameraAngle(-this.getCam().position.y, this.getCam().position.x),
      () => this.getCameraAngle(-this.getCam().position.x, this.getCam().position.y),
    ];

    // this.backgroundCamera = createCamera();
    // this.backgroundCamera.position.z = 20;

    // this.camera.position.copy(this.objectPos[0].position);
    // this.camera.quaternion.copy(this.objQuaternions[0][0]);

    // this.camera.rotateX(Math.PI / 4);
    // this.camera.add(new THREE.AxesHelper(10));

    // const helper = new THREE.AxesHelper(10);
    // this.pivotPoint.add(helper);

    // this.camera.lookAt(this.pivotPoint.position);
    const turnsDiv = document.getElementById('turns');
    turnsDiv.appendChild(this.createButton('(-1, 0, 0)', () => this.changeControls(0)));
    turnsDiv.appendChild(this.createButton('(1, 0, 0)', () => this.changeControls(1)));
    turnsDiv.appendChild(this.createButton('(0, -1, 0)', () => this.changeControls(2)));
    turnsDiv.appendChild(this.createButton('(0, 1, 0)', () => this.changeControls(3)));
    turnsDiv.appendChild(this.createButton('(0, 0, -1)', () => this.changeControls(4)));
    turnsDiv.appendChild(this.createButton('(0, 0, 1)', () => this.changeControls(5)));
    turnsDiv.appendChild(this.createButton('GET UP', () => this.testUp()));
    turnsDiv.appendChild(this.createButton('rotate right', () => this.rotateRight()));
  }

  private rotateRight = () => {
    // we should have 4 cases
    // 0 - 1
    // 1 - 2
    // 2 - 3
    // 3 - 0
    // first implement it for (0, 1, 0)


    // every up position should know how to save position on switching
    // for example from (0, 1, 0) to all other ones
    // getPosition(from, to): Vector3
    // const endPos = this.getUpPosition(0);

    // update rotating camera position
    this.changeCamera(this.length, true);
    this.rotatingCameras[this.cameraIndex].position.copy(this.cameras[this.cameraIndex].position);
    this.rotatingCameras[this.cameraIndex].quaternion.copy(this.cameras[this.cameraIndex].quaternion);

    const prevPos = this.cameras[this.cameraIndex].position.clone();
    const prevCamIndex = this.cameraIndex;

    const side = this.getSideNumber();
    this.rotate(100, () => {
      // 0 = -1 0 0 green
      // 1 = 1 0 0 blue
      // 2 = 0 -1 0 red
      // 3 = 0 1 0 orange
      // 4 = 0 0 -1 yellow
      // 5 = 0 0 1 white
      console.log('current camera index');
      console.log(this.cameraIndex);
      if (prevCamIndex === 0) {
        // 2 4 3 5
        if (side === 0) {
          this.changeControls(3);
        } else if (side === 1) {
          this.changeControls(4);
        } else if (side === 2) {
          this.changeControls(2);
        } else if (side === 3) {
          this.changeControls(5);
        }
      }
      if (prevCamIndex === 1) {
        if (side === 0) {
          this.changeControls(5);
        } else if (side === 1) {
          this.changeControls(2);
        } else if (side === 2) {
          this.changeControls(4);
        } else if (side === 3) {
          this.changeControls(3);
        }
      }
      if (prevCamIndex === 2) {
        if (side === 0) {
          this.changeControls(5);
        } else if (side === 1) {
          this.changeControls(0);
        } else if (side === 2) {
          this.changeControls(4);
        } else if (side === 3) {
          this.changeControls(1);
        }
      }
      if (prevCamIndex === 3) {
        if (side === 0) {
          this.changeControls(1);
        } else if (side === 1) {
          this.changeControls(4);
        } else if (side === 2) {
          this.changeControls(0);
        } else if (side === 3) {
          this.changeControls(5);
        }
      }
      if (prevCamIndex === 4) {
        if (side === 0) {
          this.changeControls(1);
        } else if (side === 1) {
          this.changeControls(2);
        } else if (side === 2) {
          this.changeControls(0);
        } else if (side === 3) {
          this.changeControls(3);
        }
      }
      if (prevCamIndex === 5) {
        if (side === 0) {
          this.changeControls(3);
        } else if (side === 1) {
          this.changeControls(0);
        } else if (side === 2) {
          this.changeControls(2);
        } else if (side === 3) {
          this.changeControls(1);
        }
      }
      this.cameras[this.cameraIndex].position.copy(prevPos);
    });
  }

  private testUp = () => {
    const pos = new Vector3().copy(this.cameras[this.cameraIndex].position);
    const test = [
      () => this.cameras[this.cameraIndex].position.set(pos.x, pos.y, pos.z),
      () => this.cameras[this.cameraIndex].position.set(pos.x, pos.z, pos.y),
      () => this.cameras[this.cameraIndex].position.set(pos.y, pos.z, pos.x),
      () => this.cameras[this.cameraIndex].position.set(pos.y, pos.x, pos.z),
      () => this.cameras[this.cameraIndex].position.set(pos.z, pos.x, pos.y),
      () => this.cameras[this.cameraIndex].position.set(pos.z, pos.y, pos.x),
    ];

    if (this.cameraIndex === 3) {
      this.changeControls(1);
      test[this.testCounter]();
      console.log(this.testCounter);
      this.testCounter += 1;
    }
  }

  // private getUpPosition = (toSide: number): Vector3 => {
  //   // every up position should know how to save position on switching
  //   // for example from (0, 1, 0) to all other ones
  //   // getPosition(from, to): Vector3

  //   // first implement it for (0, 1, 0)

  //   // 0 - 1
  //   // 1 - 4
  //   // 2 - 0
  //   // 3 - 5
  //   // if (toSide === )
  //   const pos = new Vector3().copy(this.cameras[this.cameraIndex].position);
  //   console.log(this.cameras[this.cameraIndex].position);
  //   if (this.cameraIndex === 3) {
  //     return new Vector3(pos.x, pos.y, pos.z);
  //   }
  // }


  private getSideNumber = (): number => {
    const angle = this.sideGet[this.cameraIndex]();
    const side = Math.floor(angle / (Math.PI / 2));
    console.log(side);
    return side;
  }

  private getCameraAngle = (y: number, x: number): number => {
    let angle = Math.atan2(y, x);

    if (angle < 0) {
      angle += Math.PI * 2;
    }

    const rad45 = Math.PI / 4;
    if (angle >= rad45 * 5) {
      angle -= rad45 * 5;
    } else {
      angle += rad45 * 3;
    }

    // console.log(MathUtils.radToDeg(angle));
    return angle;
  }

  public enable = (enable: boolean) => {
    this.controls.enabled = enable;
  }

  public getCam = () => {
    return this.isRotating ? this.rotatingCameras[this.cameraIndex] : this.cameras[this.cameraIndex];
  }

  private createButton = (name: string, func: Function) => {
    const button = document.createElement('button');
    button.innerHTML = name;
    button.onclick = () => {
      func();
      console.log(`clicked: ${name}`);
    };
    return button;
  }

  public changeCamera = (length: number, rotating: boolean = false) => {
    let camera: THREE.PerspectiveCamera;
    if (rotating) {
      camera = this.rotatingCameras[this.cameraIndex];
    } else {
      camera = this.cameras[this.cameraIndex];
    }

    this.length = length;
    camera.position.set(this.length * 1, this.length * 1.4, this.length * 2);
    camera.far = this.length * 8;
    camera.aspect = this.scene.canvas.clientWidth / this.scene.canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  private changeControls = (camIndex: number) => {
    this.cameraIndex = camIndex;
    if (this.controls !== undefined) {
      this.controls.dispose();
    }
    this.changeCamera(this.length);
    this.controls = new OrbitControls(this.cameras[this.cameraIndex], this.renderer);
  }

  private createCamera = (upX: number, upY: number, upZ: number) => {
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 20;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.up = new Vector3(upX, upY, upZ);
    return camera;
  };

  private createCameras = () => {
    this.cameras = [];
    this.rotatingCameras = [];

    this.cameras.push(this.createCamera(-1, 0, 0));
    this.rotatingCameras.push(this.createCamera(-1, 0, 0));

    this.cameras.push(this.createCamera(1, 0, 0));
    this.rotatingCameras.push(this.createCamera(1, 0, 0));

    this.cameras.push(this.createCamera(0, -1, 0));
    this.rotatingCameras.push(this.createCamera(0, -1, 0));

    this.cameras.push(this.createCamera(0, 1, 0));
    this.rotatingCameras.push(this.createCamera(0, 1, 0));

    this.cameras.push(this.createCamera(0, 0, -1));
    this.rotatingCameras.push(this.createCamera(0, 0, -1));

    this.cameras.push(this.createCamera(0, 0, 1));
    this.rotatingCameras.push(this.createCamera(0, 0, 1));
  }

  private distanceObjects = (distance: number) => {
    for (let i = 0; i < this.directions.length; i += 1) {
      this.directions[i].multiplyScalar(distance);
    }
  }

  private generateCameraPositions = () => {
    this.directions = [];

    // left
    this.directions.push(new Vector3(-1, 0, 0).normalize());
    // right
    this.directions.push(new Vector3(1, 0, 0).normalize());
    // up
    this.directions.push(new Vector3(0, 1, 0).normalize());
    // down
    this.directions.push(new Vector3(0, -1, 0).normalize());
    // front
    this.directions.push(new Vector3(0, 0, 1).normalize());
    // back
    this.directions.push(new Vector3(0, 0, -1).normalize());
  }

  rotate = (speed: number = 5000, func: Function = null) => {
    this.isRotating = true;

    const qm = new THREE.Quaternion();
    const curQuaternion = this.rotatingCameras[this.cameraIndex].quaternion.clone();

    const obj = new Object3D();
    obj.quaternion.copy(this.rotatingCameras[this.cameraIndex].quaternion.clone());
    obj.rotateZ(-Math.PI / 2);

    const targetQuaternion = obj.quaternion;

    const start = { t: 0 };
    const end = { t: 1 };

    const rotTween = new TWEEN.Tween(start).to(end, speed)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        THREE.Quaternion.slerp(curQuaternion, targetQuaternion, qm, start.t);
        qm.normalize();
        this.rotatingCameras[this.cameraIndex].rotation.setFromQuaternion(qm);
      })
      .onComplete(() => {
        this.isRotating = false;
        if (func !== null) {
          func();
        }
      })
      .start();
  }

  turn = (objectIndex: number, speed: number = 400) => {
    const startPosition = this.camera.position.clone();
    const endPosition = this.objectPos[objectIndex].position.clone();

    const angle = { value: 0 };
    const angleEnd = startPosition.angleTo(endPosition);
    const normal = startPosition.clone().cross(endPosition).normalize();

    const posTween = new TWEEN.Tween(angle)
      .to({ value: angleEnd }, speed)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(
        () => {
          this.camera.position.copy(startPosition).applyAxisAngle(normal, angle.value);
          this.camera.lookAt(this.pivotPoint.position);
        },
      )
      .start();
  }

  public update() {
    // console.log(this.getCam().position);
    // this.getSideNumber();
    if (!this.isRotating) {
      this.controls.update();
    }
    // this.getSideNumber();
    TWEEN.update();
  }
}

export default CameraControls;
