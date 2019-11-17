import * as THREE from './someFolder/build/three.module.js';
import Cube from './cube.js';
import { sides } from './variables.js';

class RubikView {
  constructor(rubikModel) {
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));


    // TODO: encapsulate each transition into a "Move" object, and keep a stack of moves
    // - that will allow us to easily generalise to other states like a "hello" state which
    // could animate the cube, or a "complete" state which could do an animation to celebrate
    // solving.

    // Maintain a queue of moves so we can perform compound actions like shuffle and solve
    this.moveQueue = [];
    this.completedMoveStack = [];
    this.currentMove = null;

    // Are we in the middle of a transition?
    this.isMoving = false;
    this.moveAxis = null;
    this.moveN = null;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    // http://stackoverflow.com/questions/20089098/three-js-adding-and-removing-children-of-rotated-objects
    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
    this.colorizeRubik();
  }


  nearlyEqual = (a, b, d) => {
    d = d || 0.001;
    return Math.abs(a - b) <= d;
  }

  // Select the plane of cubes that aligns with clickVector
  // on the given axis
  setActiveGroup = (axis) => {
    if (this.clickVector) {
      this.activeGroup = [];

      this.allCubes.forEach((cube) => {
        if (this.nearlyEqual(cube.rubikPosition[axis], this.clickVector[axis])) { 
          this.activeGroup.push(cube);
        }
      });
    } else {
      console.log('Nothing to move!');
    }
  }

  pushMove = (cube, clickVector, axis, direction) => {
    this.moveQueue.push(
      {
        cube, vector: clickVector, axis, direction,
      },
    );
  }

  startNextMove = () => {
    const nextMove = this.moveQueue.pop();

    if (nextMove) {
      this.clickVector = nextMove.vector;

      const direction = nextMove.direction || 1;
      const { axis } = nextMove;

      if (this.clickVector) {
        if (!this.isMoving) {
          this.isMoving = true;
          this.moveAxis = axis;
          this.moveDirection = direction;

          this.setActiveGroup(axis);

          this.pivot.rotation.set(0, 0, 0);
          this.pivot.updateMatrixWorld();
          this.scene.add(this.pivot);

          this.activeGroup.forEach((e) => {
            THREE.SceneUtils.attach(e, this.scene, this.pivot);
          });

          this.currentMove = nextMove;
        } else {
          console.log('Already moving!');
        }
      } else {
        console.log('Nothing to move!');
      }
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
    this.moveAxis = undefined;
    this.moveN = undefined;
    this.moveDirection = undefined;
    this.clickVector = undefined;

    this.pivot.updateMatrixWorld();
    this.scene.remove(this.pivot);
    this.activeGroup.forEach((cube) => {
      cube.updateMatrixWorld();

      cube.rubikPosition = cube.position.clone();
      cube.rubikPosition.applyMatrix4(this.pivot.matrixWorld);

      THREE.SceneUtils.detach(cube, this.pivot, this.scene);
    });

    this.completedMoveStack.push(this.currentMove);

    // Are there any more queued moves?
    this.startNextMove();
  }

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

    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      // color bottom
      this.cubes[this.rubikModel.matrixReference[sides.bottom][cube]].setColor(faceSides.bottom, this.rubikModel.matrix[sides.bottom][cube]);
      // color top
      this.cubes[this.rubikModel.matrixReference[sides.top][cube]].setColor(faceSides.top, this.rubikModel.matrix[sides.top][cube]);
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
