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
