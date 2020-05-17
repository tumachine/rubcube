/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-lonely-if */
/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import Cube from './cube';
import { Move, MoveOperation, CurrentMoveHistory } from './move';
import { sides, sidesArr, sidesOrientaion, sidesStr, sidesMap, getLargestValue, MoveHistory } from './utils';
import RubikModel from './model';
import { RenderInterface } from '../d';
import { MoveInterface } from './moveActions';
import MainScene from '..';
import { MathUtils } from '../../node_modules/three/src/Three';

interface CubeOperation {
  (side: number, cube?: number): void;
}

interface MoveComplete {
  (move: CurrentMoveHistory): void;
}

interface MouseMoveComplete {
  (): void;
}

enum PLANEORIENTATION {
  XY = 'z',
  ZY = 'x',
  XZ = 'y',
}

enum STATE {
  NONE = -1,
  MOUSE_ROTATE = 0,
  ROTATE = 1,
}

class RubikView implements RenderInterface {
  private rubikModel: RubikModel

  private scene: MainScene

  private rubik: THREE.Object3D

  private cubes: Array<Cube>

  private currentMove: MoveOperation

  public isMoving: boolean

  private moveDirection: number

  private rotationSpeed: number

  private pivot: THREE.Object3D

  private activeGroup: THREE.Object3D[]

  private name: string

  private raycastMeshes: THREE.Mesh[]

  private selectedFace: number

  private selectedCube: number

  private selectedOrientation: PLANEORIENTATION

  private mouseAxis: string

  private mouseLargest: string

  private mouseClockwise: number

  private completingMouseMove: boolean = false

  private targetRotation: number

  private mouseMoveAction: MoveInterface

  private mouseSlice: number

  private mouseMoveRotation: boolean

  private clickedOnFace: boolean

  private positionOnMouseDown: THREE.Vector3

  private distanceTrigger: number = 0.2

  private lastMousePosition: THREE.Vector3

  private mouseRotating: boolean

  private raycaster: THREE.Raycaster

  public mouseMoveCompleteHandler: MouseMoveComplete

  public moveCompleteHandler: MoveComplete

  public baseMesh: THREE.InstancedMesh

  public mouse: THREE.Vector3

  public curMoveH: CurrentMoveHistory

  constructor(rubikModel: RubikModel, scene: MainScene) {
    this.name = 'rubik';
    this.rubikModel = rubikModel;
    this.scene = scene;

    this.rubik = new THREE.Object3D();

    this.raycaster = new THREE.Raycaster();
    // pay attention to it

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    this.createRaycastMeshes();
    this.raycastMeshes.forEach((cube) => this.rubik.add(cube));

    this.currentMove = null;

    this.isMoving = false;
    this.rotationSpeed = 0.4;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];

    this.clickedOnFace = false;
    this.mouse = new THREE.Vector3(0, 0, 0);

    document.addEventListener('mousedown', this.onMouseDown.bind(this), false);

    document.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
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

  public onMouseUp = (e: MouseEvent) => {
    this.clickedOnFace = false;

    if (this.mouseRotating) {
      this.targetRotation = this.getTargetRotation();
      this.completingMouseMove = true;

      this.mouseRotating = false;
    }

    // this.scene.controls.enable(true);
    this.scene.controls.enabled = true;
  }

  private onMouseDown = (e: MouseEvent) => {
    this.updateMousePosition(e);

    this.positionOnMouseDown = this.mouse.clone();

    this.raycaster.setFromCamera(this.mouse, this.scene.camera);

    const intersects = this.raycaster.intersectObjects(this.raycastMeshes);
    if (intersects.length > 0 && !this.completingMouseMove) {
      this.clickedOnFace = true;
      this.scene.controls.enabled = false;

      const intersection = intersects[0];
      const obj = intersection.object as THREE.Mesh;
      const { point } = intersection;
      this.calculateCubeOnFace(obj.name, point);

      // console.log(`Point: ${intersects[0].point.x} ${intersects[0].point.y} ${intersects[0].point.z}`);
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.clickedOnFace) {
      this.updateMousePosition(e);

      let mPosDown = this.getMousePosition(this.positionOnMouseDown);
      let mPos = this.getMousePosition(this.mouse);

      const distance = mPos.sub(mPosDown).distanceTo(new THREE.Vector3(0, 0, 0));
      if (distance >= this.distanceTrigger) {
        console.log('TRIGGER');

        const orientation = this.selectedOrientation;
        mPosDown = this.getMousePosition(this.positionOnMouseDown, orientation);
        mPos = this.getMousePosition(this.mouse, orientation);
        const dir = mPos.sub(mPosDown);
        this.mouseMoveTrigger(dir);


        this.lastMousePosition = this.mouse.clone();
        this.mouseRotating = true;
        this.clickedOnFace = false;
      }
    } else if (this.mouseRotating) {
      this.updateMousePosition(e);

      const mPosLast = this.getMousePosition(this.lastMousePosition, this.selectedOrientation);
      const mPos = this.getMousePosition(this.mouse, this.selectedOrientation);
      const dir = mPos.sub(mPosLast);

      this.rotateWithMouse(dir);

      this.lastMousePosition = this.mouse.clone();
    }
  }

  private calculateCubeOnFace = (sideString: string, point: THREE.Vector3) => {
    const side = sidesMap[sideString];
    const vector = this.get2DVector(side, point);

    const cubeNum = vector.y * this.rubikModel.sideLength + vector.x;
    this.selectedCube = cubeNum;
    this.selectedFace = side;
    console.log(`${sideString}: ${cubeNum}`);
    // this.cubes[this.rubikModel.getCube(sidesArr[sidesMap[side]], cubeNum)].setColor(sidesMap[side], 2);
    // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[sidesMap[side]], cubeNum, this.rubikModel.interface)].setColor(sidesMap[side], 2);
  }

  private get2DVector = (side: number, point: THREE.Vector3): THREE.Vector2 => {
    const length = this.rubikModel.sideLength / 2;
    const x = Math.floor(point.x + length);
    const y = Math.floor(point.y + length);
    const z = Math.floor(point.z + length);

    let vector: THREE.Vector2;

    if (side === sides.l || side === sides.r) {
      vector = new THREE.Vector2(z, y);
      this.selectedOrientation = PLANEORIENTATION.ZY;
    } else if (side === sides.u || side === sides.d) {
      vector = new THREE.Vector2(x, z);
      this.selectedOrientation = PLANEORIENTATION.XZ;
    } else if (side === sides.f || side === sides.b) {
      vector = new THREE.Vector2(x, y);
      this.selectedOrientation = PLANEORIENTATION.XY;
    }
    return vector;
  }

  private getTargetRotation = (): number => {
    const rotation = Math.PI / 2;
    const halfRotation = rotation / 2;
    const radians = this.pivot.rotation[this.mouseAxis];

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

  private completeMouseMove() {
    // console.log('doing mouse move');
    // console.log(this.targetRotation);
    // console.log(this.pivot.rotation[this.mouseAxis]);

    const rotation = Math.PI / 2;
    const halfRotation = rotation / 2;

    if (this.pivot.rotation[this.mouseAxis] > 0) {
      if (this.pivot.rotation[this.mouseAxis] % rotation < halfRotation) {
        this.pivot.rotation[this.mouseAxis] -= (1 * 0.1);
      } else {
        this.pivot.rotation[this.mouseAxis] += (1 * 0.1);
      }
    } else {
      if (this.pivot.rotation[this.mouseAxis] % rotation < -halfRotation) {
        this.pivot.rotation[this.mouseAxis] -= (1 * 0.1);
      } else {
        this.pivot.rotation[this.mouseAxis] += (1 * 0.1);
      }
    }

    // const completion = Math.abs((this.pivot.rotation[this.mouseAxis] % (Math.PI * 2)) - this.targetRotation);
    const completion = Math.abs((this.pivot.rotation[this.mouseAxis] - this.targetRotation));
    const degrees = THREE.MathUtils.degToRad(5);
    if (completion <= degrees) {
      this.pivot.rotation[this.mouseAxis] = this.targetRotation;
      const rotations = (this.pivot.rotation[this.mouseAxis] / rotation) % 4;
      this.finishMouseMove(rotations);
    }
  }

  private finishMouseMove(rotations: number) {
    this.completingMouseMove = false;

    this.deactivateSlice();

    if (Math.abs(rotations) > 0) {
      this.rubikModel.removeHistoryByCurrentIndex();
    }

    for (let i = 0; i < Math.abs(rotations); i += 1) {
      this.mouseMoveAction(this.mouseSlice, rotations > 0);
    }

    if (this.mouseMoveCompleteHandler) {
      this.mouseMoveCompleteHandler();
    }
  }

  private rotateWithMouse(rotation: THREE.Vector3) {
    this.pivot.rotation[this.mouseAxis] += rotation[this.mouseLargest] * 0.4 * this.mouseClockwise;
  }

  private mouseMoveTrigger(direction: THREE.Vector3) {
    const col = this.selectedCube % this.rubikModel.sideLength;
    const row = Math.floor(this.selectedCube / this.rubikModel.sideLength);

    // determine what kind of move is to be performed
    const largest = getLargestValue(direction);

    let move: MoveInterface = null;
    let rotation: boolean;
    let cubes: number[];
    let slice: number;
    let axis: string;
    let mRotation: boolean;
    if (this.selectedFace === sides.l) {
      if (largest === 'y') {
        rotation = direction.y < 0;
        move = this.rubikModel.mu.B;
        // move = this.rubikModel.moveOrientation[sides.b].getcu
        cubes = this.rubikModel.getCubesDep(col);
        slice = col;
        axis = 'z';
        mRotation = true;
      } else if (largest === 'z') {
        rotation = direction.z > 0;
        move = this.rubikModel.mu.D;
        cubes = this.rubikModel.getCubesHor(row);
        slice = row;
        axis = 'y';
        mRotation = false;
      }
    } else if (this.selectedFace === sides.r) {
      // D B
      if (largest === 'y') {
        rotation = direction.y > 0;
        move = this.rubikModel.mu.B;
        cubes = this.rubikModel.getCubesDep(col);
        slice = col;
        axis = 'z';
        mRotation = false;
      } else if (largest === 'z') {
        rotation = direction.z < 0;
        move = this.rubikModel.mu.D;
        cubes = this.rubikModel.getCubesHor(row);
        slice = row;
        axis = 'y';
        mRotation = true;
      }
    } else if (this.selectedFace === sides.u) {
      // B L
      if (largest === 'x') {
        rotation = direction.x < 0;
        move = this.rubikModel.mu.B;
        cubes = this.rubikModel.getCubesDep(row);
        slice = row;
        axis = 'z';
        mRotation = true;
      } else if (largest === 'z') {
        rotation = direction.z > 0;
        move = this.rubikModel.mu.L;
        cubes = this.rubikModel.getCubesVer(col);
        slice = col;
        axis = 'x';
        mRotation = false;
      }
    } else if (this.selectedFace === sides.d) {
      // B L
      if (largest === 'x') {
        rotation = direction.x > 0;
        move = this.rubikModel.mu.B;
        cubes = this.rubikModel.getCubesDep(row);
        slice = row;
        axis = 'z';
        mRotation = false;
      } else if (largest === 'z') {
        rotation = direction.z < 0;
        move = this.rubikModel.mu.L;
        cubes = this.rubikModel.getCubesVer(col);
        slice = col;
        axis = 'x';
        mRotation = true;
      }
    } else if (this.selectedFace === sides.f) {
      // L D
      if (largest === 'x') {
        rotation = direction.x > 0;
        move = this.rubikModel.mu.D;
        cubes = this.rubikModel.getCubesHor(row);
        slice = row;
        axis = 'y';
        mRotation = false;
      } else if (largest === 'y') {
        rotation = direction.y < 0;
        move = this.rubikModel.mu.L;
        cubes = this.rubikModel.getCubesVer(col);
        slice = col;
        axis = 'x';
        mRotation = true;
      }
    } else if (this.selectedFace === sides.b) {
      // L D
      if (largest === 'x') {
        rotation = direction.x < 0;
        move = this.rubikModel.mu.D;
        cubes = this.rubikModel.getCubesHor(row);
        slice = row;
        axis = 'y';
        mRotation = true;
      } else if (largest === 'y') {
        rotation = direction.y > 0;
        move = this.rubikModel.mu.L;
        cubes = this.rubikModel.getCubesVer(col);
        slice = col;
        axis = 'x';
        mRotation = false;
      }
    }
    console.log(largest, rotation, this.selectedFace);
    console.log(mRotation);
    this.mouseAxis = axis;
    this.mouseLargest = largest;
    this.mouseClockwise = mRotation ? -1 : 1;
    this.mouseMoveAction = move;
    this.mouseSlice = slice;
    this.mouseMoveRotation = rotation;

    this.activateSlice(cubes);
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
    // this.pivot.rotation[currentMove.axis] = currentMove.clockwise ? Math.PI / 2 : Math.PI / -2;

    this.deactivateSlice();

    move.rotate(this.rubikModel.matrixReference);
  }

  public jumpToHistoryIndex = (historyIndex: number) => {
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

  public startNextMove = () => {
    if (this.isMoving) {
      console.log('Already moving');
      return;
    }
    this.curMoveH = this.rubikModel.getNextMove();

    if (this.curMoveH) {
      if (!this.isMoving) {
        if (this.curMoveH.rotateCube) {
          this.currentMove = this.rubikModel.getUserMove(this.curMoveH.move);
        } else {
          this.currentMove = this.rubikModel.getInternalMove(this.curMoveH.move);
        }

        this.isMoving = true;
        this.moveDirection = this.currentMove.clockwise ? -1 : 1;

        this.activateSlice(this.currentMove.getCubes());
      } else {
        console.log('Already moving!');
      }
    } else {
      // console.log('NOTHING');
    }
  }

  private doMove = () => {
    // do move axis
    if (this.pivot.rotation[this.currentMove.axis] >= Math.PI / 2) {
      this.pivot.rotation[this.currentMove.axis] = Math.PI / 2;
      this.moveComplete();
    } else if (this.pivot.rotation[this.currentMove.axis] <= Math.PI / -2) {
      this.pivot.rotation[this.currentMove.axis] = Math.PI / -2;
      this.moveComplete();
    } else {
      this.pivot.rotation[this.currentMove.axis] += (this.moveDirection * this.rotationSpeed);
    }
  }

  private moveComplete = () => {
    this.isMoving = false;

    this.deactivateSlice();

    // update matrix reference
    this.currentMove.rotate(this.rubikModel.matrixReference);

    if (this.moveCompleteHandler && !this.curMoveH.rotateCube) {
      this.moveCompleteHandler(this.curMoveH);
    }

    this.startNextMove();
  }


  public render = () => {
    if (this.isMoving) {
      this.doMove();
    } else if (this.completingMouseMove) {
      this.completeMouseMove();
    }
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

    for (let i = 0; i < sidesArr.length; i += 1) {
      const mesh = createMesh();
      // (mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00);
      sidesOrientaion[i](mesh, limit, 0);
      mesh.name = sidesStr[i];
      mesh.visible = false;
      this.raycastMeshes.push(mesh);
    }
  }

  private createGraphicRubik = () => {
    const cubes = [];
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
            cubes.push(cube);
          } else {
            cubes.push(null);
          }
        }
      }
    }
    return cubes;
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

  public addToScene() {
    const rubik3DObject = this.scene.scene.getObjectByName('rubik');
    if (rubik3DObject !== undefined) {
      this.scene.scene.remove(rubik3DObject);
    }

    this.rubik.name = 'rubik';
    this.scene.scene.add(this.rubik);

    console.log('Added rubik to scene');
  }
}


export default RubikView;
