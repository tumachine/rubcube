/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import Cube from './cube';
import RubikModel from './model';
import Move from './move';
import MoveActions from './moveActions';
import { sides } from './utils';

type AxisSetter = (angle: number) => THREE.Object3D;

class RubikView {
  public rubikModel: RubikModel

  public rubik: THREE.Object3D

  public cubes: Array<Cube>

  public moveN: number

  public currentMove: Move

  public isMoving: boolean

  public moveDirection: number

  public rotationSpeed: number

  public pivot: THREE.Object3D

  public activeGroup: Array<THREE.Object3D>

  public focusedAxisValue: number;

  public focusedAxisMethod: AxisSetter;

  constructor(rubikModel: RubikModel) {
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    // this.colorizeRubik();

    this.moveN = 0;
    this.currentMove = null;

    // Are we in the middle of a transition?
    this.isMoving = false;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
  }

  // translateGeneratedMoves = () => {
  //   for (let i = this.moveN; i < this.rubikModel.moveHistory.length; i += 1) {
  //     this.rubikModel.moveHistory[i].rotate(true);
  //   }
  // }
  // organize it so, moves are separated from generated to manual
  // modes: generated and manual
  // implement stop mechanism, with continue option

  startNextMove = () => {
    this.currentMove = this.rubikModel.moveHistory[this.moveN];

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

  placeTextOnRubik = () => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      // this.stRotations[1], // done
      // this.opRotations[1], // done
      // this.opRotations[0], // done
      // this.stRotations[0], // done
      // null,
      // this.opRotations[0], // done

      // text left
      // this.cubes[this.rubikModel.matrixReference[sides.l][cube]].addText(cube.toString(), sides.l);
      this.cubes[this.rubikModel.matrixReference[sides.l][this.rubikModel.stRotations[1][cube]]].addText(cube.toString(), sides.l);
      // text right
      // this.cubes[this.rubikModel.matrixReference[sides.r][cube]].addText(cube.toString(), sides.r);
      this.cubes[this.rubikModel.matrixReference[sides.r][this.rubikModel.opRotations[1][cube]]].addText(cube.toString(), sides.r);
      // text top
      // this.cubes[this.rubikModel.matrixReference[sides.u][cube]].addText(cube.toString(), sides.u);
      this.cubes[this.rubikModel.matrixReference[sides.u][this.rubikModel.opRotations[0][cube]]].addText(cube.toString(), sides.u);
      // text bottom
      // this.cubes[this.rubikModel.matrixReference[sides.d][cube]].addText(cube.toString(), sides.d);
      this.cubes[this.rubikModel.matrixReference[sides.d][this.rubikModel.stRotations[0][cube]]].addText(cube.toString(), sides.d);
      // text front
      // this.cubes[this.rubikModel.matrixReference[sides.f][cube]].addText(cube.toString(), sides.f);
      // this.cubes[this.rubikModel.matrixReference[sides.f][this.rubikModel.stRotations[0][cube]]].addText(cube.toString(), sides.f);
      // text back
      // this.cubes[this.rubikModel.matrixReference[sides.b][cube]].addText(cube.toString(), sides.b);
      this.cubes[this.rubikModel.matrixReference[sides.b][this.rubikModel.opRotations[0][cube]]].addText(cube.toString(), sides.b);
    }
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
      // color left
      this.cubes[this.rubikModel.matrixReference[sides.l][cube]].setColor(faceSides.right, this.rubikModel.matrix[sides.l][cube]);
      // this.cubes[this.rubikModel.matrixReference[sides.l][cube]].setColor(faceSides.left, this.rubikModel.matrix[sides.l][cube]);
      // color right
      this.cubes[this.rubikModel.matrixReference[sides.r][cube]].setColor(faceSides.left, this.rubikModel.matrix[sides.r][cube]);
      // this.cubes[this.rubikModel.matrixReference[sides.r][cube]].setColor(faceSides.right, this.rubikModel.matrix[sides.r][cube]);
      // color top
      this.cubes[this.rubikModel.matrixReference[sides.u][cube]].setColor(faceSides.top, this.rubikModel.matrix[sides.u][cube]);
      // color bottom
      this.cubes[this.rubikModel.matrixReference[sides.d][cube]].setColor(faceSides.bottom, this.rubikModel.matrix[sides.d][cube]);
      // color front
      this.cubes[this.rubikModel.matrixReference[sides.f][cube]].setColor(faceSides.front, this.rubikModel.matrix[sides.f][cube]);
      // color back
      this.cubes[this.rubikModel.matrixReference[sides.b][cube]].setColor(faceSides.back, this.rubikModel.matrix[sides.b][cube]);
    }
  }
}


export default RubikView;
