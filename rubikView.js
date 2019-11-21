import * as THREE from './someFolder/build/three.module.js';
import Cube from './cube.js';
import { sides } from './variables.js';

class RubikView {
  constructor(rubikModel) {
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    this.colorizeRubik();

    this.moveQueue = [];
    this.completedMoveStack = [];
    this.currentMove = null;

    // Are we in the middle of a transition?
    this.isMoving = false;
    this.moveAxis = null;
    this.moveSlice = 0;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    // http://stackoverflow.com/questions/20089098/three-js-adding-and-removing-children-of-rotated-objects
    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
    // axis 'x', 'y' or 'z'
    // direction '-1' or '1'
    //      -1 - clockwise
    //       1 - counterclockwise
    this.moves = {
      // L: () => this.pushMove('x', 1, 0),
      L: (clockwise = true, slice = 0) => this.rotate('x', !clockwise, 0 + slice),
      R: (clockwise = true, slice = 0) => this.rotate('x', clockwise, this.rubikModel.sideLength - 1 - slice),
      U: (clockwise = true, slice = 0) => this.rotate('y', clockwise, this.rubikModel.sideLength - 1 - slice),
      D: (clockwise = true, slice = 0) => this.rotate('y', !clockwise, 0 + slice),
      F: (clockwise = true, slice = 0) => this.rotate('z', clockwise, this.rubikModel.sideLength - 1 - slice),
      B: (clockwise = true, slice = 0) => this.rotate('z', !clockwise, 0 + slice),
    };
  }

  rotate = (axis, clockwise, slice) => {
    this.pushMove(axis, clockwise ? -1 : 1, slice);
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
  // axis for x, y or z
  setActiveGroup = (slice, axis) => {
    this.activeGroup = [];
    let cubes = [];
    if (axis === 'x') {
      cubes = this.rubikModel.getCubesVer(slice);
      // this.rubikModel.rotateVer(slice);
    } else if (axis === 'y') {
      cubes = this.rubikModel.getCubesHor(slice);
      // this.rubikModel.rotateHor(slice);
    } else if (axis === 'z') {
      cubes = this.rubikModel.getCubesDep(slice);
      // this.rubikModel.rotateDep(slice);
    }
    cubes.forEach((i) => this.activeGroup.push(this.cubes[i].cube));
  }

  // axis 'x', 'y' or 'z'
  // direction '-1' or '1'
  //      -1 - clockwise
  //       1 - counterclockwise
  // cube might be not needed
  pushMove = (axis, direction, slice) => {
    this.moveQueue.push({
      axis, direction, slice,
    });
  }

  startNextMove = () => {
    const nextMove = this.moveQueue.pop();

    if (nextMove) {
      const direction = nextMove.direction || 1;
      const { axis, slice } = nextMove;

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
    this.moveN = null;
    this.clickVector = undefined;

    this.pivot.updateMatrixWorld();
    this.rubik.remove(this.pivot);


    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      // THREE.SceneUtils.detach(cube, this.pivot, scene);
      this.rubik.attach(cube);
    });

    const clockwise = this.moveDirection === -1;
    if (this.moveAxis === 'x') {
      this.rubikModel.rotateVerRef(this.moveSlice, clockwise);
    } else if (this.moveAxis === 'y') {
      this.rubikModel.rotateHorRef(this.moveSlice, clockwise);
    } else if (this.moveAxis === 'z') {
      this.rubikModel.rotateDepRef(this.moveSlice, clockwise);
    }
    this.moveAxis = null;
    this.moveDirection = undefined;
    // this.rubikModel.testGreenWhiteCross();
    // this.rubikModel.testWhiteCross();

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
    const limit = Math.floor(this.rubikModel.sideLength / 2);
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

    // maybe there is a simpler way of representing rubik graphically
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      // color bottom
      this.cubes[this.rubikModel.matrixReference[sides.down][cube]].setColor(faceSides.bottom, this.rubikModel.matrix[sides.down][cube]);
      // color top
      this.cubes[this.rubikModel.matrixReference[sides.up][cube]].setColor(faceSides.top, this.rubikModel.matrix[sides.up][cube]);
      // color left
      this.cubes[this.rubikModel.matrixReference[sides.left][cube]].setColor(faceSides.right, this.rubikModel.matrix[sides.left][cube]);
      // color right
      this.cubes[this.rubikModel.matrixReference[sides.right][cube]].setColor(faceSides.left, this.rubikModel.matrix[sides.right][cube]);
      // color front
      this.cubes[this.rubikModel.matrixReference[sides.front][cube]].setColor(faceSides.front, this.rubikModel.matrix[sides.front][cube]);
      // color back
      this.cubes[this.rubikModel.matrixReference[sides.back][cube]].setColor(faceSides.back, this.rubikModel.matrix[sides.back][cube]);
    }
  }
}


export default RubikView;
