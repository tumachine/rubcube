import * as THREE from '../someFolder/build/three.module.js';
import Cube from './cube.js';
import { sides } from './variables.js';

class RubikView {
  constructor(rubikModel) {
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    // this.colorizeRubik();

    this.moveQueue = [];
    this.completedMoveStack = [];
    this.moveN = 0;
    this.currentMove = null;

    // Are we in the middle of a transition?
    this.isMoving = false;
    this.moveAxis = null;
    this.moveSlice = 0;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
    // axis 'x', 'y' or 'z'
    // direction '-1' or '1'
    //      -1 - clockwise
    //       1 - counterclockwise
    // vert 'x' rotateVer

    this.historyMoves = {
      // moves for View
      // L: (clockwise = true, slice = 0) => this.pushMove('x', clockwise ? 1 : -1, 0 + slice),
      // R: (clockwise = true, slice = 0) => this.pushMove('x', clockwise ? -1 : 1, this.rubikModel.sideLength - 1 - slice),
      // U: (clockwise = true, slice = 0) => this.pushMove('y', clockwise ? -1 : 1, this.rubikModel.sideLength - 1 - slice),
      // D: (clockwise = true, slice = 0) => this.pushMove('y', clockwise ? 1 : -1, 0 + slice),
      // F: (clockwise = true, slice = 0) => this.pushMove('z', clockwise ? -1 : 1, this.rubikModel.sideLength - 1 - slice),
      // B: (clockwise = true, slice = 0) => this.pushMove('z', clockwise ? 1 : -1, 0 + slice),

      // moves from Model
      L: (clockwise = true, slice = 0) => this.pushMove('x', clockwise ? -1 : 1, slice),
      R: (clockwise = true, slice = 0) => this.pushMove('x', clockwise ? -1 : 1, slice),
      U: (clockwise = true, slice = 0) => this.pushMove('y', clockwise ? -1 : 1, slice),
      D: (clockwise = true, slice = 0) => this.pushMove('y', clockwise ? -1 : 1, slice),
      F: (clockwise = true, slice = 0) => this.pushMove('z', clockwise ? -1 : 1, slice),
      B: (clockwise = true, slice = 0) => this.pushMove('z', clockwise ? -1 : 1, slice),
    };
  }

  // organize it so, moves are separated from generated to manual
  // modes: generated and manual
  // implement stop mechanism, with continue option
  translateGeneratedMoves = () => {
    for (let i = this.moveN; i < this.rubikModel.moveHistory.length; i += 1) {
      const {
        side, slice, clockwise,
      } = this.rubikModel.moveHistory[i];
      this.historyMoves[side](clockwise, slice);
    }
    // this.rubikModel.moveHistory.forEach((move) => {
    //   const {
    //     side, slice, clockwise,
    //   } = move;
    // this.historyMoves[side](clockwise, slice);
    // for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
    //   // extract variables from move
    //   const {
    //     side, slice, clockwise,
    //   } = this.rubikModel.moveHistory[i];

    //   this.historyMoves[side](clockwise, slice);
    // }
  }

  // axis 'x', 'y' or 'z'
  // direction '-1' or '1'
  //      -1 - clockwise
  //       1 - counterclockwise
  // cube might be not needed
  // low level move
  pushMove = (axis, direction, slice) => {
    this.moveQueue.push({
      axis, direction, slice,
    });
  }


  // select cubes that need to be rotated
  // axis for x, y or z
  setActiveGroup = (slice, axis) => {
    this.activeGroup = [];
    let cubes = [];
    // this apprach works for both modes
    if (axis === 'x') {
      cubes = this.rubikModel.getCubesVer(slice);
    } else if (axis === 'y') {
      cubes = this.rubikModel.getCubesHor(slice);
    } else if (axis === 'z') {
      cubes = this.rubikModel.getCubesDep(slice);
    }
    cubes.forEach((i) => this.activeGroup.push(this.cubes[i].cube));
  }


  startNextMove = () => {
    const nextMove = this.moveQueue[this.moveN];

    if (nextMove) {
      // const direction = nextMove.direction || 1;
      // const direction = nextMove.direction ? -1 : 1;
      const { axis, slice, direction } = nextMove;

      if (!this.isMoving) {
        this.isMoving = true;
        this.moveAxis = axis;
        this.moveSlice = slice;
        this.moveDirection = direction;

        // change it later
        this.setActiveGroup(slice, axis);

        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();
        this.rubik.add(this.pivot);

        this.activeGroup.forEach((e) => {
          this.pivot.attach(e);
        });

        // this.currentMove = nextMove;
      } else {
        console.log('Already moving!');
      }
    } else {
      console.log('NOTHING');
    }
  }

  doMove = () => {
    // Move a quarter turn then stop
    if (this.pivot.rotation[this.moveAxis] >= Math.PI / 2) {
      // Compensate for overshoot. TODO: use a tweening library
      this.pivot.rotation[this.moveAxis] = Math.PI / 2;
      this.moveComplete();
    } else if (this.pivot.rotation[this.moveAxis] <= Math.PI / -2) {
      this.pivot.rotation[this.moveAxis] = Math.PI / -2;
      this.moveComplete();
    } else {
      this.pivot.rotation[this.moveAxis] += (this.moveDirection * this.rotationSpeed);
    }
  }

  moveComplete = () => {
    this.isMoving = false;
    this.clickVector = undefined;

    this.pivot.updateMatrixWorld();
    this.rubik.remove(this.pivot);


    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      this.rubik.attach(cube);
    });

    // update matrix reference
    const nextMove = this.rubikModel.moveHistory[this.moveN];
    const { slice, clockwise, rotation } = nextMove;
    rotation(slice, clockwise, this.rubikModel.matrixReference);
    // const clockwise = this.moveDirection === -1;
    // if (this.moveAxis === 'x') {
    //   this.rubikModel.rotateVer(this.moveSlice, clockwise, this.rubikModel.matrixReference);
    // } else if (this.moveAxis === 'y') {
    //   this.rubikModel.rotateHor(this.moveSlice, clockwise, this.rubikModel.matrixReference);
    // } else if (this.moveAxis === 'z') {
    //   this.rubikModel.rotateDep(this.moveSlice, clockwise, this.rubikModel.matrixReference);
    // }
    this.moveAxis = null;
    this.moveDirection = undefined;
    this.moveN += 1;

    this.startNextMove();
  }


  render = () => {
    // States
    // TODO: generalise to something like "activeState.tick()" - see comments
    // on encapsulation above
    if (this.isMoving) {
      this.doMove();
    }
  }

  // select cubes that are to be rotated
  // need to give:
  //     slice
  //     hor, dep or ver
  //     clockwose, anticlockwise
  // setRotationCubes = (side, slice, clockwise) => {
  //   this.activeGroup = [];
  //   this.rubikModel.getCubesHor(slice).forEach((i) => this.activeGroup.push(this.cubes[i]));
  // }

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

  colorizeRubik = () => {
    const faceSides = {
      left: 0,
      right: 2,
      top: 4,
      bottom: 6,
      front: 8,
      back: 10,
    };

    // console.log(this.cubes)
    // maybe there is a simpler way of representing rubik graphically
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      // color bottom
      this.cubes[this.rubikModel.matrixReference[sides.d][cube]].setColor(faceSides.bottom, this.rubikModel.matrix[sides.d][cube]);
      // color top
      this.cubes[this.rubikModel.matrixReference[sides.u][cube]].setColor(faceSides.top, this.rubikModel.matrix[sides.u][cube]);
      // color left
      this.cubes[this.rubikModel.matrixReference[sides.l][cube]].setColor(faceSides.right, this.rubikModel.matrix[sides.l][cube]);
      // color right
      this.cubes[this.rubikModel.matrixReference[sides.r][cube]].setColor(faceSides.left, this.rubikModel.matrix[sides.r][cube]);
      // color front
      this.cubes[this.rubikModel.matrixReference[sides.f][cube]].setColor(faceSides.front, this.rubikModel.matrix[sides.f][cube]);
      // color back
      this.cubes[this.rubikModel.matrixReference[sides.b][cube]].setColor(faceSides.back, this.rubikModel.matrix[sides.b][cube]);
    }
  }
}


export default RubikView;
