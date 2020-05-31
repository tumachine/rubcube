/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
import TWEEN from 'tween.ts';
import * as THREE from '../../node_modules/three/src/Three';
import Cube from './cube';
import { Move, MoveOperation, CurrentMoveHistory } from './move';
import { Side, getLargestValue, MoveHistory, rotateSide, getLargestIndex } from './utils';
import RubikModel from './model';
import { RenderInterface } from '../d';
import { MoveInterface } from './moveActions';
import MainScene from '..';

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

class RubikView implements RenderInterface {
  private rubikModel: RubikModel

  private scene: MainScene

  private rubik: THREE.Object3D

  private cubes: Array<Cube>

  public isMoving: boolean

  private pivot: THREE.Object3D

  private activeGroup: THREE.Object3D[]

  private name: string

  private raycastMeshes: THREE.Mesh[]

  private selectedFace: number

  private selectedCube: number

  private selectedOrientation: PLANEORIENTATION

  private mouseRotation: boolean

  private mouseAxis: string

  private mouseLargest: string

  private mouseClockwise: boolean

  private mouseMoveAction: MoveInterface

  private mouseSlice: number

  private clickedOnFace: boolean

  private positionOnMouseDown: THREE.Vector3

  private distanceTrigger: number = 0.2

  private lastMousePosition: THREE.Vector3

  private mouseRotating: boolean

  private raycaster: THREE.Raycaster

  public mouseMoveCompleteHandler: MouseMoveComplete

  public moveCompleteHandler: Function

  public mouse: THREE.Vector3

  private halfMoveThresholdPassed: boolean

  private mouseTime: number

  private mouseDistance: number

  private doAnimationToHistoryIndex: number

  constructor(sideLength: number, scene: MainScene) {
    this.rubikModel = new RubikModel(sideLength);
    this.name = 'rubik';
    this.scene = scene;

    this.rubik = new THREE.Object3D();

    this.createGraphicRubik();
    this.createRaycastMeshes();

    this.isMoving = false;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];

    this.clickedOnFace = false;
    this.mouse = new THREE.Vector3(0, 0, 0);

    this.raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', this.onMouseDown.bind(this), false);

    document.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    this.drawNewRubik();
  }

  private drawNewRubik() {
    this.scene.renderObjects[0] = this;

    const rubik3DObject = this.scene.scene.getObjectByName('rubik');
    if (rubik3DObject !== undefined) {
      this.scene.scene.remove(rubik3DObject);
    }

    this.rubik.name = 'rubik';
    this.scene.scene.add(this.rubik);
    console.log('Added rubik to scene');


    this.enableBase();
    this.changeCamera();
    console.log(this.scene.renderer.info.memory);
  }

  get length() {
    return this.rubikModel.sideLength;
  }

  get currentHistoryIndex() {
    return this.rubikModel.currentHistoryIndex;
  }

  get history() {
    return this.rubikModel.moveHistory;
  }

  public stopAnimation = () => {
    this.rubikModel.clearCurrentMoves();
    this.doAnimationToHistoryIndex = this.currentHistoryIndex;
  }

  public doMoves = (to: number) => {
    this.doAnimationToHistoryIndex = to;
    this.doMovesToHistoryIndex();
  }

  public scramble = (moves: number) => {
    this.rubikModel.generateRandomMoves(moves);
    this.doAnimationToHistoryIndex = this.rubikModel.moveHistory.length - 1;
    this.doMovesToHistoryIndex();
  }

  public solve = () => {
    this.rubikModel.generateSolveMoves();
    this.doAnimationToHistoryIndex = this.rubikModel.moveHistory.length - 1;
    this.doMovesToHistoryIndex();
  }

  public moveBack() {
    this.rubikModel.moveBackward();
    this.doStandardMoveAnimation();
  }

  public moveForward() {
    this.rubikModel.moveForward();
    this.doStandardMoveAnimation();
  }

  public jumpAndReset(historyIndex: number) {
    this.rubikModel.jumpToHistoryIndex(historyIndex);

    this.rubikModel.resetSO();
    this.resetCubePositions();
    this.colorizeBase();
  }

  public resetInPlace() {
    this.rubikModel.jumpToHistoryIndex(this.rubikModel.currentHistoryIndex);

    this.rubikModel.resetSO();
    this.resetCubePositions();
    this.colorizeBase();
  }

  private wrapRotation(func: Function) {
    return () => {
      if (!this.isMoving) {
        func();
        this.doStandardMoveAnimation();
      }
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
    this.rubikModel.doUserMove(side, slice, clockwise);
    this.doStandardMoveAnimation();
  }

  private updateMousePosition = (event: MouseEvent) => {
    const rect = this.scene.canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX / rect.width) * 2 - 1;
    this.mouse.y = -(event.clientY / rect.height) * 2 + 1;
  }

  private getMousePosition = (mouse: THREE.Vector3, plane: PLANEORIENTATION = PLANEORIENTATION.XY): THREE.Vector3 => {
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(this.scene.camera);
    const dir = vector.sub(this.scene.camera.position).normalize();
    const distance = -this.scene.camera.position[plane] / dir[plane];
    const pos = this.scene.camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
  }

  private onMouseDown = (e: MouseEvent) => {
    this.updateMousePosition(e);

    this.positionOnMouseDown = this.mouse.clone();

    this.raycaster.setFromCamera(this.mouse, this.scene.camera);

    const intersects = this.raycaster.intersectObjects(this.raycastMeshes);
    if (!this.mouseRotating) {
      if (intersects.length > 0) {
        this.clickedOnFace = true;
        this.scene.controls.enabled = false;

        const intersection = intersects[0];
        const obj = intersection.object as THREE.Mesh;
        const { point } = intersection;
        this.setVarsOnCubeClick(obj.name, point);
        // console.log(`Point: ${intersects[0].point.x} ${intersects[0].point.y} ${intersects[0].point.z}`);
      }
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.clickedOnFace && !this.isMoving) {
      this.updateMousePosition(e);

      let mPosDown = this.getMousePosition(this.positionOnMouseDown);
      let mPos = this.getMousePosition(this.mouse);

      const distance = mPos.sub(mPosDown).distanceTo(new THREE.Vector3(0, 0, 0));
      if (distance >= this.distanceTrigger) {
        console.log('TRIGGER');

        mPosDown = this.getMousePosition(this.positionOnMouseDown, this.selectedOrientation);
        mPos = this.getMousePosition(this.mouse, this.selectedOrientation);
        const dir = mPos.sub(mPosDown);
        this.mouseMoveTrigger(dir);

        this.halfMoveThresholdPassed = false;
        this.mouseDistance = 0;
        this.mouseTime = Date.now();

        this.lastMousePosition = this.mouse.clone();
        this.mouseRotating = true;
        this.clickedOnFace = false;
      }
    } else if (this.mouseRotating) {
      this.updateMousePosition(e);

      const mPosLast = this.getMousePosition(this.lastMousePosition, this.selectedOrientation);
      const mPos = this.getMousePosition(this.mouse, this.selectedOrientation);
      const distance = mPos.sub(mPosLast);

      this.mouseDistance += distance.length();

      const mouseRotation = this.mouseClockwise ? -1 : 1;

      this.pivot.rotation[this.mouseAxis] += distance[this.mouseLargest] * 0.4 * mouseRotation;

      if (!this.halfMoveThresholdPassed) {
        if (Math.abs(this.pivot.rotation[this.mouseAxis]) > Math.PI / 4) {
          this.halfMoveThresholdPassed = true;
        }
      }

      this.lastMousePosition = this.mouse.clone();
    }
  }

  private setVarsOnCubeClick = (sideString: string, point: THREE.Vector3) => {
    const side = Side.fromString(sideString);
    const vector = this.getVectorBasedOnSide(side, point);
    const cubeNum = vector.y * this.rubikModel.sideLength + vector.x;

    this.selectedCube = cubeNum;
    this.selectedFace = side;
    this.selectedOrientation = this.determinePlaneOrientation(side);
    // console.log(`${sideString}: ${cubeNum}`);
    // this.cubes[this.rubikModel.getCube(side, cubeNum)].setColor(side, 2);
    // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[sidesMap[side]], cubeNum, this.rubikModel.interface)].setColor(sidesMap[side], 2);



    // const cube = this.cubes[this.rubikModel.getCube(side, cubeNum)];
    // const cubeObject = cube.cube;
    // const cubePosition = cubeObject.position;

    // const cubeArr = cubePosition.toArray();

    // const cubeArrAbs = cubeArr.map((item) => Math.abs(item));
    // const largestIndex = getLargestIndex(...cubeArrAbs);
    // const sameIndexes = [];
    // cubeArrAbs.forEach((val, index) => {
    //   if (val === cubeArrAbs[largestIndex]) {
    //     sameIndexes.push(index);
    //   }
    // });

    // for (let i = 0; i < sameIndexes.length; i += 1) {
    //   if (cubeArr[sameIndexes[i]] > 0) {
    //     cubeArr[sameIndexes[i]] += 1;
    //   } else {
    //     cubeArr[sameIndexes[i]] -= 1;
    //   }
    // }
    // const start = { x: cube.cube.position.x, y: cube.cube.position.y, z: cube.cube.position.z };
    // const end = { x: cubeArr[0], y: cubeArr[1], z: cubeArr[2] };
    // cubePosition.set(cubeArr[0], cubeArr[1], cubeArr[2]);



    // new TWEEN.Tween(start)
    //   .to(end, 5000)
    //   .easing(TWEEN.Easing.Linear.None)
    //   .onUpdate(() => {
    //     cube.cube.position.x = start.x;
    //     cube.cube.position.y = start.y;
    //     cube.cube.position.z = start.z;
    //   })
    //   .onComplete(() => {
    //   })
    //   .start();


    // colorize cube
    const cube = this.rubikModel.getCube(side, cubeNum);

    const sideDirections: THREE.Vector3[] = new Array(6);

    sideDirections[Side.l] = new THREE.Vector3(-1, 0, 0);
    sideDirections[Side.r] = new THREE.Vector3(1, 0, 0);
    sideDirections[Side.u] = new THREE.Vector3(0, 1, 0);
    sideDirections[Side.d] = new THREE.Vector3(0, -1, 0);
    sideDirections[Side.f] = new THREE.Vector3(0, 0, 1);
    sideDirections[Side.b] = new THREE.Vector3(0, 0, -1);

    // now we need to determine to which side cube belongs
    const isHorEdge = (direction: number) => {
      const row = this.rubikModel.getRow(this.selectedCube);
      return row === 0 || row === this.rubikModel.sideLength - 1;
    };

    const isVerEdge = (direction: number) => {
      const col = this.rubikModel.getColumn(this.selectedCube);
      return col === 0 || col === this.rubikModel.sideLength - 1;
    };

    const isEdge = (direction: number) => {
      return isVerEdge(direction) && isHorEdge(direction);
    };

    let direction: THREE.Vector3;
    if (isEdge(cube)) {
      // only 8 cases that can be easily resolved

    } else if (isHorEdge(cube)) {

    } else if (isVerEdge(cube)) {

    } else {
      direction = sideDirections[side];
    }

    // before coloring, resetInPlace();
    // console.log(this.cubes[cube].baseMeshes);
    // this.cubes[cube].setCustomColor(side, 0xff0000);
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

  public onMouseUp = (e: MouseEvent) => {
    this.clickedOnFace = false;

    if (this.mouseRotating) {
      this.completeMouseWithTween();
    }

    this.scene.controls.enabled = true;
  }

  private completeMouseWithTween = () => {
    const start = { angle: this.pivot.rotation[this.mouseAxis] };
    const end = { angle: this.getTargetRotation() };

    this.doMoveAnimation(start, end, this.mouseAxis, () => {
      const rotations = (this.pivot.rotation[this.mouseAxis] / (Math.PI / 2)) % 4;
      if (Math.abs(rotations) > 0) {
        this.rubikModel.removeHistoryByCurrentIndex();
      }

      for (let i = 0; i < Math.abs(rotations); i += 1) {
        this.mouseMoveAction(this.mouseSlice, rotations > 0);
      }

      if (this.mouseMoveCompleteHandler) {
        this.mouseMoveCompleteHandler();
      }

      this.mouseRotating = false;
    });
  }

  private mouseMoveTrigger(direction: THREE.Vector3) {
    const col = this.rubikModel.getColumn(this.selectedCube);
    const row = this.rubikModel.getRow(this.selectedCube);

    // determine what kind of move is to be performed
    this.mouseLargest = getLargestValue(direction);

    if (this.selectedFace === Side.l) {
      if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y < 0;
        this.mouseMoveAction = this.rubikModel.mu.B;
        this.activateSlice(this.rubikModel.getCubesDep(col));
        this.mouseSlice = col;
        this.mouseAxis = 'z';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z > 0;
        this.mouseMoveAction = this.rubikModel.mu.D;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = false;
      }
    } else if (this.selectedFace === Side.r) {
      // D B
      if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y > 0;
        this.mouseMoveAction = this.rubikModel.mu.B;
        this.activateSlice(this.rubikModel.getCubesDep(col));
        this.mouseSlice = col;
        this.mouseAxis = 'z';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z < 0;
        this.mouseMoveAction = this.rubikModel.mu.D;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = true;
      }
    } else if (this.selectedFace === Side.u) {
      // B L
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x < 0;
        this.mouseMoveAction = this.rubikModel.mu.B;
        this.activateSlice(this.rubikModel.getCubesDep(row));
        this.mouseSlice = row;
        this.mouseAxis = 'z';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z > 0;
        this.mouseMoveAction = this.rubikModel.mu.L;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = false;
      }
    } else if (this.selectedFace === Side.d) {
      // B L
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x > 0;
        this.mouseMoveAction = this.rubikModel.mu.B;
        this.activateSlice(this.rubikModel.getCubesDep(row));
        this.mouseSlice = row;
        this.mouseAxis = 'z';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'z') {
        this.mouseRotation = direction.z < 0;
        this.mouseMoveAction = this.rubikModel.mu.L;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = true;
      }
    } else if (this.selectedFace === Side.f) {
      // L D
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x > 0;
        this.mouseMoveAction = this.rubikModel.mu.D;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = false;
      } else if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y < 0;
        this.mouseMoveAction = this.rubikModel.mu.L;
        this.activateSlice(this.rubikModel.getCubesVer(col));
        this.mouseSlice = col;
        this.mouseAxis = 'x';
        this.mouseClockwise = true;
      }
    } else if (this.selectedFace === Side.b) {
      // L D
      if (this.mouseLargest === 'x') {
        this.mouseRotation = direction.x < 0;
        this.mouseMoveAction = this.rubikModel.mu.D;
        this.activateSlice(this.rubikModel.getCubesHor(row));
        this.mouseSlice = row;
        this.mouseAxis = 'y';
        this.mouseClockwise = true;
      } else if (this.mouseLargest === 'y') {
        this.mouseRotation = direction.y > 0;
        this.mouseMoveAction = this.rubikModel.mu.L;
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

  private activateSlice = (cubes: number[]) => {
    cubes.forEach((i: number) => this.activeGroup.push(this.cubes[i].cube));

    this.pivot.rotation.set(0, 0, 0);
    this.pivot.updateMatrixWorld();
    this.rubik.add(this.pivot);

    this.activeGroup.forEach((e) => {
      this.pivot.attach(e);
    });
  }

  private deactivateSlice = () => {
    this.pivot.updateMatrixWorld();
    this.rubik.remove(this.pivot);

    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      this.rubik.attach(cube);
    });


    this.activeGroup = [];
  }

  private doNoAnimationMove = (move: MoveOperation) => {
    this.activateSlice(move.getCubes());

    this.pivot.rotation[move.axis] = move.clockwise ? Math.PI / -2 : Math.PI / 2;

    this.deactivateSlice();

    move.rotate(this.rubikModel.matrixReference);
  }

  public jumpSaveRotation = (historyIndex: number) => {
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
      currentAnimatedMove.rotate(this.rubikModel.matrixReference);

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
      .to(end, 200)
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

    this.raycastMeshes.forEach((cube) => this.rubik.add(cube));
  }

  private createGraphicRubik = () => {
    this.cubes = [];
    // draw rubic
    // depend on a side length
    let limit = Math.floor(this.rubikModel.sideLength / 2);
    if (this.rubikModel.sideLength % 2 === 0) {
      limit = this.rubikModel.sideLength / 2 - 0.5;
    }

    for (let y = -limit; y <= limit; y += 1) {
      for (let z = -limit; z <= limit; z += 1) {
        for (let x = -limit; x <= limit; x += 1) {
          // add only those cubes that are on the outside
          if (y === -limit || y === limit || z === -limit || z === limit || x === -limit || x === limit) {
            const cube = new Cube(x, y, z);
            this.cubes.push(cube);
          } else {
            this.cubes.push(null);
          }
        }
      }
    }
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));
  }

  public changeCamera() {
    const length = this.rubikModel.sideLength;
    this.scene.camera.position.set(length * 1.5, length * 1.2, length * 2);
    this.scene.camera.far = length * 4;
    this.scene.camera.updateProjectionMatrix();
  }

  private forEveryCube = (func: CubeOperation) => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < 6; s += 1) {
        func(s, cube);
      }
    }
  }

  private createBaseMesh = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].createMeshes(side);
  }

  private createOuterMesh = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].createOuterMeshes(side, this.rubikModel.sideLength);
  }

  private createTextMesh = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].createTextMeshes(side);
  }

  private resetCubePosition = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].resetPosition();
  }

  private colorizeBaseCube = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].setColor(side, this.rubikModel.getColor(side, cube, this.rubikModel.matrix));
  }

  private colorizeOuterCube = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].setOuterColor(side, this.rubikModel.getColor(side, cube, this.rubikModel.matrix));
  }

  private placeTextOnCube = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].setText(side, cube.toString());
  }

  private dispose = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].dispose();
  }

  private disposeOuterMeshes = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].disposeOuter();
  }

  private disposeTextMeshes = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].disposeText();
  }

  private disposeBaseMeshes = (side: number, cube: number) => {
    this.cubes[this.rubikModel.getCube(side, cube)].disposeBase();
  }

  public enableBase = () => {
    this.forEveryCube(this.createBaseMesh);
    this.forEveryCube(this.colorizeBaseCube);
  }

  public colorizeBase = () => {
    this.forEveryCube(this.colorizeBaseCube);
  }

  public disposeBase = () => {
    this.forEveryCube(this.disposeBaseMeshes);
  }

  public enableOuter = () => {
    this.forEveryCube(this.createOuterMesh);
    this.forEveryCube(this.colorizeOuterCube);
  }

  public colorizeOuter = () => {
    this.forEveryCube(this.colorizeOuterCube);
  }

  public disposeOuter = () => {
    this.forEveryCube(this.disposeOuterMeshes);
  }

  public enableText = () => {
    this.forEveryCube(this.createTextMesh);
    this.forEveryCube(this.placeTextOnCube);
  }

  public disposeText = () => {
    this.forEveryCube(this.disposeTextMeshes);
  }

  public placeText = () => {
    this.forEveryCube(this.placeTextOnCube);
  }

  public resetCubePositions = () => {
    this.forEveryCube(this.resetCubePosition);
  }

  public disposeAll = () => {
    this.forEveryCube(this.dispose);
  }
}


export default RubikView;
