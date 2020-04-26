/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';
import Cube from './cube';
import Move from './move';
import { sides, sidesArr } from './utils';
import RubikModel from './model';
import { RenderInterface, ChangeSceneInterface } from '../d';

type AxisSetter = (angle: number) => THREE.Object3D;

class RubikView implements RenderInterface, ChangeSceneInterface {
  public rubikModel: RubikModel

  public rubik: THREE.Object3D

  public cubes: Array<Cube>

  public moveN: number

  public currentMove: Move

  public isMoving: boolean

  public moveDirection: number

  public rotationSpeed: number

  public pivot: THREE.Object3D

  public activeGroup: THREE.Object3D[]

  public focusedAxisValue: number;

  public focusedAxisMethod: AxisSetter;

  public name: string

  constructor(rubikModel: RubikModel) {
    this.name = 'rubik';
    this.rubikModel = rubikModel;

    this.rubik = new THREE.Object3D();

    this.cubes = this.createGraphicRubik();
    this.cubes.map((cube) => (cube ? this.rubik.add(cube.getCube()) : null));

    this.moveN = 0;
    this.currentMove = null;

    this.isMoving = false;
    this.moveDirection = null;
    this.rotationSpeed = 0.2;

    this.pivot = new THREE.Object3D();
    this.activeGroup = [];
  }

  public startNextMove = () => {
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
    this.moveN += 1;

    this.startNextMove();
  }


  render = () => {
    if (this.isMoving) {
      this.doMove();
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
    // const inter = [
    //   this.rubikModel.stRotations[3],
    //   this.rubikModel.opRotations[3],
    //   this.rubikModel.opRotations[2],
    //   this.rubikModel.stRotations[2],
    //   this.rubikModel.stRotations[0],
    //   this.rubikModel.opRotations[0],
    // ];
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[s], cube, inter)].addText(cube.toString(), sidesArr[s]);
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].addText(cube.toString(), sidesArr[s]);
      }
    }

    // for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
    // text left
    // this.cubes[this.rubikModel.matrixReference[sides.l][this.rubikModel.stRotations[3][cube]]].addText(cube.toString(), sides.l);
    // this.cubes[this.rubikModel.getCubeFromInterface(sides.l, cube, inter)].addText(cube.toString(), sides.l);
    // // text right
    // this.cubes[this.rubikModel.matrixReference[sides.r][this.rubikModel.opRotations[3][cube]]].addText(cube.toString(), sides.r);
    // // text top
    // this.cubes[this.rubikModel.matrixReference[sides.u][this.rubikModel.opRotations[2][cube]]].addText(cube.toString(), sides.u);
    // // text bottom
    // this.cubes[this.rubikModel.matrixReference[sides.d][this.rubikModel.stRotations[2][cube]]].addText(cube.toString(), sides.d);
    // // text front
    // this.cubes[this.rubikModel.matrixReference[sides.f][this.rubikModel.stRotations[0][cube]]].addText(cube.toString(), sides.f);
    // // text back
    // this.cubes[this.rubikModel.matrixReference[sides.b][this.rubikModel.opRotations[0][cube]]].addText(cube.toString(), sides.b);
    // }
  }

  createMeshes = () => {
    for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
      for (let s = 0; s < sidesArr.length; s += 1) {
        this.cubes[this.rubikModel.getCube(sidesArr[s], cube)].createMeshes(sidesArr[s]);
        // cubes.push(this.matrixReference[sequence[face]][layer[face][i]]);
        // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[s], cube, this.rubikModel.interface)].createMeshes(sidesArr[s]);
      }
    }
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
        // this.cubes[this.rubikModel.getCubeFromInterface(sidesArr[s], cube, this.rubikModel.interface)].setColor(sidesArr[s], this.rubikModel.getColor(sidesArr[s], cube));
      }
    }
    // for (let cube = 0; cube < this.rubikModel.totalColors; cube += 1) {
    //   // color left
    //   this.cubes[this.rubikModel.matrixReference[sides.l][cube]].setColor(sides.l, this.rubikModel.matrix[sides.l][cube]);
    //   // color right
    //   this.cubes[this.rubikModel.matrixReference[sides.r][cube]].setColor(sides.r, this.rubikModel.matrix[sides.r][cube]);
    //   // color top
    //   this.cubes[this.rubikModel.matrixReference[sides.u][cube]].setColor(sides.u, this.rubikModel.matrix[sides.u][cube]);
    //   // color bottom
    //   this.cubes[this.rubikModel.matrixReference[sides.d][cube]].setColor(sides.d, this.rubikModel.matrix[sides.d][cube]);
    //   // color front
    //   this.cubes[this.rubikModel.matrixReference[sides.f][cube]].setColor(sides.f, this.rubikModel.matrix[sides.f][cube]);
    //   // color back
    //   this.cubes[this.rubikModel.matrixReference[sides.b][cube]].setColor(sides.b, this.rubikModel.matrix[sides.b][cube]);
    // }
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
