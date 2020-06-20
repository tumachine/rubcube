/* eslint-disable no-param-reassign */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import TWEEN from 'tween.ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import CubePlane from './cube';
import { Move, MoveOperation, CurrentMoveHistory, CubeDir } from './move';
import { Side, getLargestValue, MoveHistory, rotateSide, getLargestIndex, randomColor } from './utils';
import RubikModel from './model';
import { RenderInterface } from '../d';
import MoveActions, { MoveInterface } from './moveActions';
import MainScene from '..';
import Sprite from './sprite';
import { SceneObject, MouseEventObject } from '../SceneObject';

interface CubeOperation {
  (side: number, cube?: number): void;
}

interface MouseMoveComplete {
  (): void;
}

enum PLANEORIENTATION {
  XY = 'z',
  ZY = 'x',
  XZ = 'y',
}

interface TweenAngle {
  angle: number
}

interface CubePosition {
  side: number,
  direction: number,
}

interface MeshIntersection {
  intersected: boolean,
  name: string,
  point: THREE.Vector3,
}

class RubikView implements SceneObject {
  private rubikModel: RubikModel

  public object: THREE.Object3D

  private planes: CubePlane[][]

  public isMoving: boolean

  public isCurrentMoving: boolean

  private pivot: THREE.Object3D

  private activeGroup: THREE.Object3D[]

  private raycastMeshes: THREE.Mesh[]

  private selectedSide: number

  private selectedDirection: number

  private selectedOrientation: PLANEORIENTATION

  private mouseRotation: boolean

  private mouseAxis: string

  private mouseLargest: string

  private mouseClockwise: boolean

  private mouseSide: number

  private mouseSlice: number

  private clickedOnFace: boolean

  private positionOnMouseDown: THREE.Vector3

  private distanceTrigger: number = 0.2

  private lastMousePosition: THREE.Vector3

  private mouseRotating: boolean

  private raycaster: THREE.Raycaster

  public moveCompleteHandler: (move: CurrentMoveHistory) => void;

  public newMoveHandler: () => void;

  private halfMoveThresholdPassed: boolean

  private mouseTime: number

  private mouseDistance: number

  private doAnimationToHistoryIndex: number

  private sprite: Sprite

  public speed: number = 200

  constructor(sideLength: number) {
    this.rubikModel = new RubikModel(sideLength);

    this.object = new THREE.Object3D();
    this.object.name = 'rubik';

    this.sprite = new Sprite(sideLength);

    this.createGraphicRubik();
    this.createRaycastMeshes();

    this.isMoving = false;
    this.isCurrentMoving = false;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];

    this.clickedOnFace = false;

    this.raycaster = new THREE.Raycaster();

    this.enableBase();
    console.log('creating rubik view');
  }

  controlCamera(camera: THREE.PerspectiveCamera): void {
    const length = this.rubikModel.sideLength;
    camera.position.set(length * 1.5, length * 1.2, length * 2);
    camera.far = length * 4;
    camera.updateProjectionMatrix();
  }

  public getLength = () => this.rubikModel.sideLength;

  public getCurrentHistoryIndex = () => this.rubikModel.currentHistoryIndex;

  public getHistory = () => this.rubikModel.moveHistory;

  public stopAnimation = () => {
    this.rubikModel.clearCurrentMoves();
    this.doAnimationToHistoryIndex = this.getCurrentHistoryIndex();
  }

  public doMoves = (to: number) => {
    this.StopOrDoMove(() => {
      this.doAnimationToHistoryIndex = to;
      this.doMovesToHistoryIndex();
    });
  }

  public scramble = (moves: number) => {
    this.StopOrDoMove(() => {
      this.rubikModel.generateRandomMoves(moves);
      this.doAnimationToHistoryIndex = this.rubikModel.moveHistory.length - 1;
      this.doMovesToHistoryIndex();
      this.newMoveHandler();
    });
  }

  public solve = () => {
    this.StopOrDoMove(() => {
      this.rubikModel.generateSolveMoves();
      this.doAnimationToHistoryIndex = this.rubikModel.moveHistory.length - 1;
      this.doMovesToHistoryIndex();
      this.newMoveHandler();
    });
  }

  private StopOrDoMove(func: () => void) {
    if (this.isMoving) {
      this.stopAnimation();
    } else {
      func();
    }
  }

  public moveBack() {
    this.StopOrDoMove(() => {
      this.rubikModel.moveBackward();
      this.doStandardMoveAnimation();
    });
  }

  public moveForward() {
    this.StopOrDoMove(() => {
      this.rubikModel.moveForward();
      this.doStandardMoveAnimation();
    });
  }

  public jump(historyIndex: number) {
    this.StopOrDoMove(() => {
      if (Math.abs(historyIndex - this.getCurrentHistoryIndex()) > 1000) {
        this.jumpAndReset(historyIndex);
      } else {
        this.jumpSaveRotation(historyIndex);
      }
    });
  }

  private jumpAndReset(historyIndex: number) {
    this.rubikModel.jumpToHistoryIndex(historyIndex);

    this.rubikModel.resetSO();
    this.resetCubePositions();
    this.resetPlanes();
    this.colorizeBase();
  }

  public resetInPlace() {
    this.jumpSaveRotation(this.rubikModel.currentHistoryIndex);
  }

  private wrapRotation(func: Function) {
    return () => {
      this.StopOrDoMove(() => {
        func();
        this.doStandardMoveAnimation();
      });
    };
  }

  public cubeRotationOperations = {
    up: this.wrapRotation(() => this.rubikModel.rotateOVer(false)),
    down: this.wrapRotation(() => this.rubikModel.rotateOVer(true)),
    left: this.wrapRotation(() => this.rubikModel.rotateOHor(false)),
    right: this.wrapRotation(() => this.rubikModel.rotateOHor(true)),
    clockwise: this.wrapRotation(() => this.rubikModel.rotateODep(false)),
    counter: this.wrapRotation(() => this.rubikModel.rotateODep(true)),
  }

  public doMove = (side: number, slice: number, clockwise: boolean) => {
    this.StopOrDoMove(() => {
      this.rubikModel.doUserMove(side, slice, clockwise);
      this.doStandardMoveAnimation();
      this.newMoveHandler();
    });
  }

  // private updateMousePosition = (event: MouseEvent) => {
  //   const rect = this.scene.canvas.getBoundingClientRect();
  //   this.mouse.x = (event.clientX / rect.width) * 2 - 1;
  //   this.mouse.y = -(event.clientY / rect.height) * 2 + 1;
  // }

  private getMousePositionBasedOnCameraOrientation = (mouse: THREE.Vector3, camera: THREE.PerspectiveCamera, plane: PLANEORIENTATION = PLANEORIENTATION.XY): THREE.Vector3 => {
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position[plane] / dir[plane];
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
  }

  public onMouseDown = (mouseEO: MouseEventObject) => {
    const { mouse, camera, controls } = mouseEO;
    this.positionOnMouseDown = mouse.clone();

    if (!this.mouseRotating) {
      // check for mesh being cube - probably check for correct name
      const { intersected, name, point } = this.mouseOnMesh(mouse, camera);
      if (intersected) {
        this.clickedOnFace = true;
        controls.enabled = false;
        const { side, direction } = this.getCubePositionOnCubeIntersection(name, point);

        this.selectedSide = side;
        this.selectedOrientation = this.determinePlaneOrientation(side);
        this.selectedDirection = direction;
      }
    }
  }

  private mouseOnMesh = (mouse: THREE.Vector3, camera: THREE.PerspectiveCamera): MeshIntersection => {
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObjects(this.raycastMeshes);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const obj = intersection.object as THREE.Mesh;
      const { point } = intersection;
      return { intersected: true, name: obj.name, point };
    }
    return { intersected: false, name: null, point: null };
  }

  public onMouseMove(mouseEO: MouseEventObject) {
    const { mouse, camera } = mouseEO;
    const { intersected, name, point } = this.mouseOnMesh(mouse, camera);

    if (intersected) {
      // check for mesh being cube - probably check for correct name
      const { side, direction } = this.getCubePositionOnCubeIntersection(name, point);
      // for the test
      if (side === 4 && direction === 0) {
        this.onCubeHover(side, direction);
      }
    }

    if (this.clickedOnFace && !this.isMoving) {
      let mPosDown = this.getMousePositionBasedOnCameraOrientation(this.positionOnMouseDown, camera);
      let mPos = this.getMousePositionBasedOnCameraOrientation(mouse, camera);

      const distance = mPos.sub(mPosDown).distanceTo(new THREE.Vector3(0, 0, 0));
      if (distance >= this.distanceTrigger) {
        // console.log('TRIGGER');

        mPosDown = this.getMousePositionBasedOnCameraOrientation(this.positionOnMouseDown, camera, this.selectedOrientation);
        mPos = this.getMousePositionBasedOnCameraOrientation(mouse, camera, this.selectedOrientation);
        const dir = mPos.sub(mPosDown);
        this.mouseMoveTrigger(dir);

        this.halfMoveThresholdPassed = false;
        this.mouseDistance = 0;
        this.mouseTime = Date.now();

        this.lastMousePosition = mouse.clone();
        this.mouseRotating = true;
        this.clickedOnFace = false;
      }
    } else if (this.mouseRotating) {
      const mPosLast = this.getMousePositionBasedOnCameraOrientation(this.lastMousePosition, camera, this.selectedOrientation);
      const mPos = this.getMousePositionBasedOnCameraOrientation(mouse, camera, this.selectedOrientation);
      const distance = mPos.sub(mPosLast);

      this.mouseDistance += distance.length();

      const mouseRotation = this.mouseClockwise ? -1 : 1;

      this.pivot.rotation[this.mouseAxis] += distance[this.mouseLargest] * 0.4 * mouseRotation;

      if (!this.halfMoveThresholdPassed) {
        if (Math.abs(this.pivot.rotation[this.mouseAxis]) > Math.PI / 4) {
          this.halfMoveThresholdPassed = true;
        }
      }

      this.lastMousePosition = mouse.clone();
    }
  }

  // expects mouse position to be already updated
  private onCubeHover = (side: number, direction: number) => {
    const plane = this.planes[side][direction];
    // plane.setCustomColor(randomColor());
    // const hoverMap
  }

  private getCubePositionOnCubeIntersection = (sideString: string, point: THREE.Vector3): CubePosition => {
    const side = Side.fromString(sideString);
    const vector = this.getVectorBasedOnSide(side, point);
    const direction = vector.y * this.rubikModel.sideLength + vector.x;

    return { side, direction };
  }

  private temp() {
    // bump cube
    // this.planes[side][cubeNum].object.translateZ(1);
    // color cube
    // this.planes[side][cubeNum].setCustomColor(0xff0000);

    const originalPosition = this.planes[side][direction].baseMesh.position.clone();

    const position = originalPosition.clone();
    const to = originalPosition.clone();
    to.z += 1;

    const onUpdate = () => {
      this.planes[side][direction].baseMesh.position.z = position.z;
    };

    const t1 = new TWEEN.Tween(position)
      .to(to, 500)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(onUpdate);

    const t2 = new TWEEN.Tween(position)
      .to(originalPosition, 500)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(onUpdate);

    t1.chain(t2);
    t1.start();

    // colorize cube
    // const cube = this.rubikModel.getCube(side, cubeNum);

    // const sideDirections: THREE.Vector3[] = new Array(6);

    // sideDirections[Side.l] = new THREE.Vector3(-1, 0, 0);
    // sideDirections[Side.r] = new THREE.Vector3(1, 0, 0);
    // sideDirections[Side.u] = new THREE.Vector3(0, 1, 0);
    // sideDirections[Side.d] = new THREE.Vector3(0, -1, 0);
    // sideDirections[Side.f] = new THREE.Vector3(0, 0, 1);
    // sideDirections[Side.b] = new THREE.Vector3(0, 0, -1);

    // // now we need to determine to which side cube belongs
    // const isHorEdge = (direction: number) => {
    //   const row = this.rubikModel.getRow(this.selectedCube);
    //   return row === 0 || row === this.rubikModel.sideLength - 1;
    // };

    // const isVerEdge = (direction: number) => {
    //   const col = this.rubikModel.getColumn(this.selectedCube);
    //   return col === 0 || col === this.rubikModel.sideLength - 1;
    // };

    // const isEdge = (direction: number) => {
    //   return isVerEdge(direction) && isHorEdge(direction);
    // };

    // let direction: THREE.Vector3;
    // if (isEdge(cube)) {
    //   // only 8 cases that can be easily resolved

    // } else if (isHorEdge(cube)) {

    // } else if (isVerEdge(cube)) {

    // } else {
    //   direction = sideDirections[side];
    // }
  }

  private determinePlaneOrientation = (side: number): PLANEORIENTATION => {
    if (side === Side.l || side === Side.r) {
      return PLANEORIENTATION.ZY;
    } else if (side === Side.u || side === Side.d) {
      return PLANEORIENTATION.XZ;
    } else if (side === Side.f || side === Side.b) {
      return PLANEORIENTATION.XY;
    }
    return undefined;
  }

  private getVectorBasedOnSide = (side: number, point: THREE.Vector3): THREE.Vector2 => {
    const length = this.rubikModel.sideLength / 2;
    const x = Math.floor(point.x + length);
    const y = Math.floor(point.y + length);
    const z = Math.floor(point.z + length);

    if (side === Side.l || side === Side.r) {
      return new THREE.Vector2(z, y);
    } else if (side === Side.u || side === Side.d) {
      return new THREE.Vector2(x, z);
    } else if (side === Side.f || side === Side.b) {
      return new THREE.Vector2(x, y);
    }
  }

  private getTargetRotation = (): number => {
    const rotation = Math.PI / 2;
    const halfRotation = rotation / 2;
    const radians = this.pivot.rotation[this.mouseAxis];

    const time = Date.now() - this.mouseTime;
    const speed = this.mouseDistance / time;

    if (this.halfMoveThresholdPassed || speed < 0.004) {
      if (radians > 0) {
        if (radians % rotation > halfRotation) {
          return (Math.floor(radians / rotation) + 1) * rotation;
        } else {
          return Math.floor(radians / rotation) * rotation;
        }
      } else if (radians < 0) {
        if (radians % rotation < -halfRotation) {
          return Math.floor(radians / rotation) * rotation;
        } else {
          return (Math.floor(radians / rotation) + 1) * rotation;
        }
      }
    }

    if (radians > 0) {
      return rotation;
    } else {
      return -rotation;
    }
  }

  public onMouseUp = (mouseEO: MouseEventObject) => {
    const { controls } = mouseEO;
    this.clickedOnFace = false;

    if (this.mouseRotating) {
      this.completeMouseWithTween();
    }

    controls.enabled = true;
  }

  private completeMouseWithTween = () => {
    const start = { angle: this.pivot.rotation[this.mouseAxis] };
    const end = { angle: this.getTargetRotation() };

    this.doMoveAnimation(start, end, this.mouseAxis, () => {
      const rotations = (this.pivot.rotation[this.mouseAxis] / (Math.PI / 2)) % 4;
      if (Math.abs(rotations) > 0) {
        this.rubikModel.removeHistoryByCurrentIndex();

        let currentMove: CurrentMoveHistory;
        for (let i = 0; i < Math.abs(rotations); i += 1) {
          currentMove = this.rubikModel.doUserMove(this.mouseSide, this.mouseSlice, rotations > 0, false);
          currentMove.onComplete();
          currentMove.getMove().rotate(this.planes);
        }
        if (this.moveCompleteHandler && this.newMoveHandler) {
          // console.log(this.getHistory());
          this.newMoveHandler();
          this.moveCompleteHandler(currentMove);
        }
      }

      this.mouseRotating = false;
    });
  }

  private mouseMoveTrigger(direction: THREE.Vector3) {
    const col = this.rubikModel.getColumn(this.selectedDirection);
    const row = this.rubikModel.getRow(this.selectedDirection);

    // determine what kind of move is to be performed
    this.mouseLargest = getLargestValue(direction);

    if (this.selectedSide === Side.l) {
      if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y < 0;
        this.mouseSide = Side.b;
        this.activateSlice(this.rubikModel.getCubesDep(col));
        this.mouseSlice = col;
        this.mouseAxis = 'z';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z > 0;
        this.mouseSide = Side.d;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = false;
      }
    } else if (this.selectedSide === Side.r) {
      // D B
      if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y > 0;
        this.mouseSide = Side.b;
        this.activateSlice(this.rubikModel.getCubesDep(col));
        this.mouseSlice = col;
        this.mouseAxis = 'z';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z < 0;
        this.mouseSide = Side.d;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = true;
      }
    } else if (this.selectedSide === Side.u) {
      // B L
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x < 0;
        this.mouseSide = Side.b;
        this.activateSlice(this.rubikModel.getCubesDep(row));
        this.mouseSlice = row;
        this.mouseAxis = 'z';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z > 0;
        // this.mouseMoveAction = this.mu.L;
        this.mouseSide = Side.l;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = false;
      }
    } else if (this.selectedSide === Side.d) {
      // B L
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x > 0;
        this.mouseSide = Side.b;
        this.activateSlice(this.rubikModel.getCubesDep(row));
        this.mouseSlice = row;
        this.mouseAxis = 'z';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z < 0;
        this.mouseSide = Side.l;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = true;
      }
    } else if (this.selectedSide === Side.f) {
      // L D
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x > 0;
        this.mouseSide = Side.d;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y < 0;
        this.mouseSide = Side.l;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = true;
      }
    } else if (this.selectedSide === Side.b) {
      // L D
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x < 0;
        this.mouseSide = Side.d;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y > 0;
        this.mouseSide = Side.l;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = false;
      }
    }
    // console.log(largest, rotation, this.selectedFace);
    // console.log(mRotation);
    // this.mouseMoveRotation = rotation;
  }

  private activateSlice = (cubes: CubeDir[]) => {
    cubes.forEach((c: CubeDir) => {
      this.activeGroup.push(this.planes[c.side][c.direction].object);
    });

    this.pivot.rotation.set(0, 0, 0);
    this.pivot.updateMatrixWorld();
    this.object.add(this.pivot);

    this.activeGroup.forEach((e) => {
      this.pivot.attach(e);
    });
  }

  private deactivateSlice = () => {
    this.pivot.updateMatrixWorld();
    this.object.remove(this.pivot);

    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      this.object.attach(cube);
    });


    this.activeGroup = [];
  }

  private doNoAnimationMove = (move: MoveOperation) => {
    this.activateSlice(move.getCubes());

    this.pivot.rotation[move.axis] = move.clockwise ? Math.PI / -2 : Math.PI / 2;

    this.deactivateSlice();

    move.rotate(this.planes);
  }

  private jumpSaveRotation = (historyIndex: number) => {
    const steps = historyIndex - this.rubikModel.currentHistoryIndex;
    if (steps > 0) {
      // move forward
      for (let i = 0; i < steps; i += 1) {
        this.rubikModel.currentHistoryIndex += 1;
        const currentMove = this.rubikModel.moveHistory[this.rubikModel.currentHistoryIndex];

        const iMove = this.rubikModel.getUserMove(currentMove);
        iMove.rotate(this.rubikModel.matrix);

        const gMove = this.rubikModel.getInternalMove(currentMove);
        this.doNoAnimationMove(gMove);
      }
    } else if (steps < 0) {
      // move backwards
      const absSteps = Math.abs(steps);
      for (let i = 0; i < absSteps; i += 1) {
        const currentMove = this.rubikModel.moveHistory[this.rubikModel.currentHistoryIndex];
        const backwardsMove: MoveHistory = { side: currentMove.side, slice: currentMove.slice, clockwise: !currentMove.clockwise };

        const iMove = this.rubikModel.getUserMove(backwardsMove);
        iMove.rotate(this.rubikModel.matrix);

        const gMove = this.rubikModel.getInternalMove(backwardsMove);
        this.doNoAnimationMove(gMove);

        this.rubikModel.currentHistoryIndex -= 1;
      }
    }
  }

  private doCurrentMoveAnimation = (move: CurrentMoveHistory, onComplete: Function = null) => {
    const currentAnimatedMove = move.getMove();

    this.activateSlice(currentAnimatedMove.getCubes());

    const start = { angle: 0 };
    const end = { angle: currentAnimatedMove.clockwise ? Math.PI / -2 : Math.PI / 2 };

    this.doMoveAnimation(start, end, currentAnimatedMove.axis, () => {
      this.isMoving = false;
      currentAnimatedMove.rotate(this.planes);

      move.onComplete();

      if (onComplete) {
        onComplete();
      }

      if (this.moveCompleteHandler) {
        this.moveCompleteHandler(move);
      }
    });
  }

  public doStandardMoveAnimation = () => {
    if (this.isMoving) {
      console.log('Already moving');
      return;
    }

    const move = this.rubikModel.getNextMove();
    if (move) {
      this.isMoving = true;

      this.doCurrentMoveAnimation(move, () => {
        this.doStandardMoveAnimation();
      });
    }
  }

  // needs slice to be already activated
  private doMoveAnimation = (start: TweenAngle, end: TweenAngle, axis: string, onComplete: Function = null) => {
    new TWEEN.Tween(start)
      .to(end, this.speed)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this.pivot.rotation[axis] = start.angle;
      })
      .onComplete(() => {
        this.deactivateSlice();

        if (onComplete) {
          onComplete();
        }
      })
      .start();
  }

  public doMovesToHistoryIndex = () => {
    if (this.isMoving) {
      console.log('Already moving');
      return;
    }

    this.isMoving = true;
    const steps = this.doAnimationToHistoryIndex - this.rubikModel.currentHistoryIndex;
    if (steps > 0) {
      this.rubikModel.moveForward();
    } else if (steps < 0) {
      this.rubikModel.moveBackward();
    }

    const move = this.rubikModel.getNextMove();
    this.doCurrentMoveAnimation(move, () => {
      if (this.rubikModel.currentHistoryIndex !== this.doAnimationToHistoryIndex) {
        this.doMovesToHistoryIndex();
      }
    });
  }

  public render = () => {
    // this.planes[0][0].toTween.update();
    TWEEN.update();
  }

  private createRaycastMeshes = () => {
    this.raycastMeshes = [];
    let limit = Math.floor(this.rubikModel.sideLength / 2);
    if (this.rubikModel.sideLength % 2 === 0) {
      limit = this.rubikModel.sideLength / 2 - 0.5;
    }

    const percentBigger = 1;
    limit = (limit / 100) * percentBigger + limit;

    const length = this.rubikModel.sideLength;

    const material = new THREE.MeshBasicMaterial();
    const geometry = new THREE.PlaneBufferGeometry(length, length);

    const createMesh = () => {
      const mesh = new THREE.Mesh(
        geometry,
        material.clone(),
      );
      return mesh;
    };

    for (let i = 0; i < 6; i += 1) {
      const mesh = createMesh();
      // (mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00);
      rotateSide(i, mesh, limit, 0);
      mesh.name = Side.toString(i);
      mesh.visible = false;
      this.raycastMeshes.push(mesh);
    }

    this.raycastMeshes.forEach((cube) => this.object.add(cube));
  }

  private createEmptyPlane = (): CubePlane[][] => {
    const planes = new Array<Array<CubePlane>>(6);
    for (let i = 0; i < planes.length; i += 1) {
      planes[i] = new Array<CubePlane>(this.getLength() * this.getLength());
    }
    return planes;
  }

  private createGraphicRubik = () => {
    // draw rubic
    // depend on a side length
    let limit = Math.floor(this.rubikModel.sideLength / 2);
    if (this.rubikModel.sideLength % 2 === 0) {
      limit = this.rubikModel.sideLength / 2 - 0.5;
    }

    this.planes = this.createEmptyPlane();

    let counter = 0;
    for (let i = -limit; i <= limit; i += 1) {
      for (let j = -limit; j <= limit; j += 1) {
        this.planes[Side.l][counter] = (new CubePlane(-limit, i, j, Side.l, counter));
        this.planes[Side.r][counter] = (new CubePlane(limit, i, j, Side.r, counter));
        this.planes[Side.u][counter] = (new CubePlane(j, limit, i, Side.u, counter));
        this.planes[Side.d][counter] = (new CubePlane(j, -limit, i, Side.d, counter));
        this.planes[Side.f][counter] = (new CubePlane(j, i, limit, Side.f, counter));
        this.planes[Side.b][counter] = (new CubePlane(j, i, -limit, Side.b, counter));
        counter += 1;
      }
    }

    for (let s = 0; s < 6; s += 1) {
      for (let p = 0; p < this.planes[s].length; p += 1) {
        this.object.add(this.planes[s][p].object);
      }
    }
  }

  private resetPlanes = () => {
    const planes = this.createEmptyPlane();
    for (let s = 0; s < 6; s += 1) {
      for (let d = 0; d < planes[s].length; d += 1) {
        const plane = this.planes[s][d];
        planes[plane.originalSide][plane.originalDirection] = plane;
      }
    }
    this.planes = planes;
  }


  private forEveryCube = (func: CubeOperation) => {
    for (let s = 0; s < 6; s += 1) {
      for (let p = 0; p < this.planes[s].length; p += 1) {
        func(s, p);
      }
    }
  }

  private createBaseMesh = (side: number, plane: number) => {
    this.planes[side][plane].createMesh();
  }

  private createOuterMesh = (side: number, plane: number) => {
    this.planes[side][plane].createOuterMesh(this.rubikModel.sideLength);
  }

  private createImageMesh = (side: number, plane: number) => {
    const p = this.planes[side][plane];
    if (!p.imageMesh) {
      this.planes[side][plane].createImageMesh();
    }
  }

  private resetCubePosition = (side: number, plane: number) => {
    this.planes[side][plane].resetPosition();
  }

  private colorizeBaseCube = (side: number, plane: number) => {
    this.planes[side][plane].setColor(this.rubikModel.getColor(side, plane, this.rubikModel.matrix));
  }

  private colorizeOuterCube = (side: number, plane: number) => {
    const origSide = this.planes[side][plane].originalSide;
    this.planes[side][plane].setOuterColor(origSide);
  }

  private placeTextureOnCube = (side: number, plane: number) => {
    const direction = this.planes[side][plane].originalDirection;
    const image = this.sprite.getTexture(direction);

    this.planes[side][plane].setImage(image);
  }

  private disposePlane = (side: number, plane: number) => {
    this.planes[side][plane].dispose();
  }

  private disposeOuterMesh = (side: number, plane: number) => {
    this.planes[side][plane].disposeOuter();
  }

  private disposeImageMesh = (side: number, plane: number) => {
    this.planes[side][plane].disposeImage();
  }

  private disposeBaseMesh = (side: number, plane: number) => {
    this.planes[side][plane].disposeBase();
  }

  public enableBase = () => {
    this.forEveryCube(this.createBaseMesh);
    this.forEveryCube(this.colorizeBaseCube);
  }

  public colorizeBase = () => {
    this.forEveryCube(this.colorizeBaseCube);
  }

  public disposeBase = () => {
    this.forEveryCube(this.disposeBaseMesh);
  }

  public enableOuter = () => {
    this.forEveryCube(this.createOuterMesh);
    this.forEveryCube(this.colorizeOuterCube);
  }

  public colorizeOuter = () => {
    this.forEveryCube(this.colorizeOuterCube);
  }

  public disposeOuter = () => {
    this.forEveryCube(this.disposeOuterMesh);
  }

  public drawText = () => {
    this.sprite.fillSpriteWithDirections();
    this.forEveryCube(this.createImageMesh);
    this.forEveryCube(this.placeTextureOnCube);
  }

  public drawImages = () => {
    this.sprite.setImage('../textures/chess.png', () => {
      this.forEveryCube(this.createImageMesh);
      this.forEveryCube(this.placeTextureOnCube);
    });
  }

  public disposeImages = () => {
    this.forEveryCube(this.disposeImageMesh);
  }

  public resetCubePositions = () => {
    this.forEveryCube(this.resetCubePosition);
  }

  public dispose = () => {
    this.forEveryCube(this.disposePlane);

    // this.scene.scene.remove(this.rubik);

    this.sprite.dispose();
  }
}


export default RubikView;
