/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import Cube from './cube';
import Move from './move';
import { sides, sidesArr, createMesh, sidesOrientaion, sidesStr, sidesMap, planeOrientation } from './utils';
import RubikModel from './model';
import { RenderInterface, ChangeSceneInterface } from '../d';
import { Vector2, Vector3, MathUtils } from '../../node_modules/three/src/Three';
import { MoveInterface } from './moveActions';
import { pathToFileURL } from 'url';

type AxisSetter = (angle: number) => THREE.Object3D;

class RubikView implements RenderInterface, ChangeSceneInterface {
  private rubikModel: RubikModel

  public rubik: THREE.Object3D

  private cubes: Array<Cube>

  private currentMove: Move

  private isMoving: boolean

  private moveDirection: number

  private rotationSpeed: number

  private pivot: THREE.Object3D

  private activeGroup: THREE.Object3D[]

  public drawCube: boolean = true

  public drawOuterCube: boolean = false

  public drawText: boolean = false

  public name: string

  public raycastMeshes: THREE.Mesh[]

  // public baseMeshes: THREE.Mesh[]

  public selectedFace: number

  public selectedCube: number

  public selectedOrientation: planeOrientation

  private mouseAxis: string

  public mouseLargest: string

  private mouseClockwise: number

  private completingMouseMove: boolean = false

  private targetRotation: number

  private mouseMove: MoveInterface

  private mouseSlice: number

  private mouseMoveRotation: boolean

  constructor(rubikModel: RubikModel) {
    this.name = 'rubik';
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();
    // pay attention to it

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    this.createRaycastMeshes();
    this.raycastMeshes.forEach((cube) => this.rubik.add(cube));

    this.currentMove = null;

    this.isMoving = false;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
  }

  public calculateCubeOnFace = (side: string, point: THREE.Vector3) => {
    const vector = this.get2DVector(sidesMap[side], point);
    // console.log(vector.x, vector.y);
    const cubeNum = vector.y * this.rubikModel.sideLength + vector.x;
    this.selectedCube = cubeNum;
    this.selectedFace = sidesMap[side];
    console.log(`${side}: ${cubeNum}`);
    // this.cubes[this.rubikModel.getCube(sidesArr[sidesMap[side]], cubeNum)].setColor(sidesMap[side], 2);
    // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[sidesMap[side]], cubeNum, this.rubikModel.interface)].setColor(sidesMap[side], 2);
    // we need to know slice
  }

  private get2DVector = (side: number, point: THREE.Vector3): THREE.Vector2 => {
    const length = this.rubikModel.sideLength / 2;
    const x = Math.floor(point.x + length);
    const y = Math.floor(point.y + length);
    const z = Math.floor(point.z + length);

    let vector: THREE.Vector2;

    if (side === sides.l || side === sides.r) {
      vector = new THREE.Vector2(z, y);
      this.selectedOrientation = planeOrientation.ZY;
    } else if (side === sides.u || side === sides.d) {
      vector = new THREE.Vector2(x, z);
      this.selectedOrientation = planeOrientation.XZ;
    } else if (side === sides.f || side === sides.b) {
      vector = new THREE.Vector2(x, y);
      this.selectedOrientation = planeOrientation.XY;
    }
    return vector;
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

    for (let i = 0; i < sidesArr.length; i += 1) {
      const mesh = createMesh(length, length);
      // (mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00);
      sidesOrientaion[i](mesh, limit, 0);
      mesh.name = sidesStr[i];
      mesh.visible = false;
      this.raycastMeshes.push(mesh);
    }
  }

  stopRotation() {
    const rotation = Math.PI / 2;
    const halfRotation = rotation / 2;
    const radians = this.pivot.rotation[this.mouseAxis];

    if (radians > 0) {
      if (radians % rotation > halfRotation) {
        this.targetRotation = (Math.floor(radians / rotation) + 1) * rotation;
      } else {
        this.targetRotation = Math.floor(radians / rotation) * rotation;
      }
    } else if (radians < 0) {
      if (radians % rotation < -halfRotation) {
        this.targetRotation = Math.floor(radians / rotation) * rotation;
      } else {
        this.targetRotation = (Math.floor(radians / rotation) + 1) * rotation;
      }
    }

    this.completingMouseMove = true;
  }

  doMouseMove() {
    // console.log('doing mouse move');
    // console.log(this.targetRotation);
    // console.log(this.pivot.rotation[this.mouseAxis]);
    // if (this.pivot.rotation[this.mouseAxis] > this.targetRotation) {
    //   this.pivot.rotation[this.mouseAxis] += (this.mouseClockwise * 0.03);
    // } else if (this.pivot.rotation[this.mouseAxis] < this.targetRotation) {
    //   this.pivot.rotation[this.mouseAxis] += (this.mouseClockwise * 0.03 * -1);
    // }

    // const completion = Math.abs(this.pivot.rotation[this.mouseAxis] - this.targetRotation);
    // const degrees = MathUtils.degToRad(5);
    // if (completion <= degrees) {
    //   this.pivot.rotation[this.mouseAxis] = this.targetRotation;
    //   this.moveMouseComplete();
    // }

    const rotation = Math.PI / 2;
    const halfRotation = rotation / 2;

    console.log('Mouse move');
    if (this.pivot.rotation[this.mouseAxis] > 0) {
      if (this.pivot.rotation[this.mouseAxis] % rotation < halfRotation) {
        this.pivot.rotation[this.mouseAxis] -= (1 * 0.03);
      } else {
        this.pivot.rotation[this.mouseAxis] += (1 * 0.03);
      }
    } else {
      if (this.pivot.rotation[this.mouseAxis] % rotation < -halfRotation) {
        this.pivot.rotation[this.mouseAxis] -= (1 * 0.03);
      } else {
        this.pivot.rotation[this.mouseAxis] += (1 * 0.03);
      }
    }

    const completion = Math.abs((this.pivot.rotation[this.mouseAxis] % (Math.PI * 2)) - this.targetRotation);
    const degrees = MathUtils.degToRad(5);
    if (completion <= degrees) {
      this.pivot.rotation[this.mouseAxis] = this.targetRotation;
      this.moveMouseComplete(this.pivot.rotation[this.mouseAxis] / rotation);
    }
  }

  moveMouseComplete(rotations: number) {
    this.completingMouseMove = false;

    this.pivot.updateMatrixWorld();
    this.rubik.remove(this.pivot);

    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      this.rubik.attach(cube);
    });

    let rotation: boolean;

    if (this.selectedFace === sides.l) {
      if (this.mouseLargest === 'y') {
        rotation = rotations > 0;
      } else if (this.mouseLargest === 'z') {
        rotation = rotations > 0;
      }
    } else if (this.selectedFace === sides.r) {
      // D B
      if (this.mouseLargest === 'y') {
        rotation = rotations > 0;
      } else if (this.mouseLargest === 'z') {
        rotation = rotations > 0;
      }
    } else if (this.selectedFace === sides.u) {
      // B L
      if (this.mouseLargest === 'x') {
        rotation = rotations < 0;
      } else if (this.mouseLargest === 'z') {
        rotation = rotations > 0;
      }
    } else if (this.selectedFace === sides.d) {
      // B L
      if (this.mouseLargest === 'x') {
        rotation = rotations > 0;
      } else if (this.mouseLargest === 'z') {
        rotation = rotations > 0;
      }
    } else if (this.selectedFace === sides.f) {
      // L D
      if (this.mouseLargest === 'x') {
        rotation = rotations > 0;
      } else if (this.mouseLargest === 'y') {
        rotation = rotations > 0;
      }
    } else if (this.selectedFace === sides.b) {
      // L D
      if (this.mouseLargest === 'x') {
        rotation = rotations > 0;
      } else if (this.mouseLargest === 'y') {
        rotation = rotations > 0;
      }
    }
    // update matrix reference

    for (let i = 0; i < Math.abs(rotations); i += 1) {
      this.mouseMove(this.mouseSlice, rotation);
    }
    // this.mouseMove(this.mouseSlice, rotation);

    this.activeGroup = [];
  }

  rotate(rotation: Vector3) {
    this.pivot.rotation[this.mouseAxis] += rotation[this.mouseLargest] * 0.4 * this.mouseClockwise;
  }

  getLargestValue = (vec: THREE.Vector3) => {
    const absX = Math.abs(vec.x);
    const absY = Math.abs(vec.y);
    const absZ = Math.abs(vec.z);
    if (absX > absY && absX > absZ) {
      return 'x';
    }

    if (absY > absX && absY > absZ) {
      return 'y';
    }

    return 'z';
  }

  rotateWithMouse(direction: THREE.Vector3) {
    const col = this.selectedCube % this.rubikModel.sideLength;
    const row = Math.floor(this.selectedCube / this.rubikModel.sideLength);

    // determine what kind of move is to be performed
    const largest = this.getLargestValue(direction);

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
      }
    } else if (this.selectedFace === sides.r) {
      // D B
      if (largest === 'y') {
        rotation = direction.y > 0;
        move = this.rubikModel.mu.B;
        cubes = this.rubikModel.getCubesDep(col);
        slice = col;
        axis = 'z';
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
      }
    } else if (this.selectedFace === sides.d) {
      // B L
      if (largest === 'x') {
        rotation = direction.x > 0;
        move = this.rubikModel.mu.B;
        cubes = this.rubikModel.getCubesDep(row);
        slice = row;
        axis = 'z';
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
      }
    }
    console.log(largest, rotation, this.selectedFace);
    this.mouseAxis = axis;
    this.mouseLargest = largest;
    this.mouseClockwise = mRotation ? -1 : 1;
    this.mouseMove = move;
    this.mouseSlice = slice;
    this.mouseMoveRotation = rotation;

    cubes.forEach((i: number) => this.activeGroup.push(this.cubes[i].cube));

    this.pivot.rotation.set(0, 0, 0);
    this.pivot.updateMatrixWorld();
    this.rubik.add(this.pivot);

    this.activeGroup.forEach((e) => {
      this.pivot.attach(e);
    });
  }

  public startNextMove = () => {
    if (this.isMoving) {
      console.log('Already moving');
      return;
    }
    this.currentMove = this.rubikModel.getNextMove();

    if (this.currentMove) {
      if (!this.isMoving) {
        this.isMoving = true;
        this.moveDirection = this.currentMove.clockwise ? -1 : 1;

        // select cubes that need to be rotated
        (this.currentMove.getCubes()).forEach((i: number) => this.activeGroup.push(this.cubes[i].cube));
        // this.setActiveGroup(slice, side);

        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();
        this.rubik.add(this.pivot);

        this.activeGroup.forEach((e) => {
          this.pivot.attach(e);
        });
      } else {
        console.log('Already moving!');
      }
    } else {
      console.log('NOTHING');
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

    this.pivot.updateMatrixWorld();
    this.rubik.remove(this.pivot);


    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      this.rubik.attach(cube);
    });

    // update matrix reference
    this.currentMove.rotate(false);

    this.activeGroup = [];
    this.moveDirection = undefined;

    this.startNextMove();
  }


  render = () => {
    if (this.isMoving) {
      this.doMove();
    }

    if (this.completingMouseMove) {
      this.doMouseMove();
    }
  }

  createGraphicRubik = () => {
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

  placeTextOnRubik = (inter: number[][]) => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].setText(sidesArr[s], cube.toString());
      }
    }
  }

  createMeshes = () => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].createMeshes(sidesArr[s]);
        // this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].createOuterMeshes(sidesArr[s], this.rubikModel.sideLength);
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].createTextMeshes(sidesArr[s]);
      }
    }
    // this.baseMeshes = this.getAllMeshes();
  }

  resetCubePositions = () => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].resetPosition();
      }
    }
  }

  colorizeRubik = () => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].setColor(sidesArr[s], this.rubikModel.getColor(sidesArr[s], cube));
        // this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].setOuterColor(sidesArr[s], this.rubikModel.getColor(sidesArr[s], cube));
      }
    }
  }

  changeCamera(camera: THREE.PerspectiveCamera) {
    const length = this.rubikModel.sideLength;
    camera.position.set(length * 1.5, length * 1.2, length * 2);
    camera.far = length * 4;
    camera.updateProjectionMatrix();
    // this.camera.lookAt(this.controls.target);
  }

  addToScene(scene: THREE.Scene) {
    const rubik3DObject = scene.getObjectByName('rubik');
    if (rubik3DObject !== undefined) {
      scene.remove(rubik3DObject);
    }

    this.rubik.name = 'rubik';
    scene.add(this.rubik);

    console.log('Added rubik to scene');
  }
}


export default RubikView;
