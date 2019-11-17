import { sides } from './variables.js';

class RubikModel {
  constructor(sideLength) {
    this.sideLength = sideLength;
    this.totalColors = sideLength * sideLength;
    this.matrix = this.createMatrix();
    this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);


    // this.posHor = this.PositionHorizontal();
    // this.posVer = this.PositionVertical();
    // this.posDep = this.PositionDepth();
    // this.posClockwise = this.PositionFaceClockwise();
    // this.posAnticlockwise = this.PositioinFaceAnticlockwise();
    this.posHor = null;
    this.posVer = null;
    this.posDep = null;
    this.posClockwise = null;
    this.posAnticlockwise = null;
    this.generatePositions();

    this.sequenceHor = [sides.front, sides.left, sides.back, sides.right, sides.front];
    this.sequenceVer = [sides.top, sides.back, sides.bottom, sides.front, sides.top];
    this.sequenceDep = [sides.left, sides.top, sides.right, sides.bottom, sides.left];
    this.sequenceHorRev = [...this.sequenceHor].reverse();
    this.sequenceVerRev = [...this.sequenceVer].reverse();
    this.sequenceDepRev = [...this.sequenceDep].reverse();

    //   rotate(matrix, posVer, sequenceVert, 0);
    // this.rotate(this.posDep, this.sequenceDep, 0);
  }

  rotateVer = (slice) => {
    this.rotate(this.posVer, this.sequenceVer, slice);
    this.rotateFaceReal(slice, sides.left, sides.right, this.posClockwise);
    // conso
  }

  rotateHor = (slice) => {
    this.rotate(this.posHor, this.sequenceHor, slice);
    this.rotateFaceReal(slice, sides.bottom, sides.top, this.posClockwise);
  }

  rotateDep = (slice) => {
    this.rotate(this.posDep, this.sequenceDep, slice);
    this.rotateFaceReal(slice, sides.back, sides.front, this.posAnticlockwise);
  }


    createMatrix = () => {
      const totalColors = this.sideLength * this.sideLength;
      const matrixRubic = [];
      const sides = 6;
      for (let i = 0; i < sides; i += 1) {
        const tempArr = [];
        for (let q = 0; q < totalColors; q += 1) {
          tempArr.push(i);
        }
        matrixRubic.push(tempArr);
      }

      return matrixRubic;
    }

    createMatrixReference = (cubes) => {
      const matrixRubic = [
        [],
        [],
        [],
        [],
        [],
        [],
      ];

      // indexes bottom
      for (let cube = 0; cube < this.totalColors; cube += 1) {
        matrixRubic[sides.bottom].push(cube);
      }

      // indexes top
      for (let cube = cubes - this.totalColors; cube < cubes; cube += 1) {
        matrixRubic[sides.top].push(cube);
      }

      // indexes left
      for (let cube = 0; cube < cubes; cube += this.sideLength) {
        matrixRubic[sides.left].push(cube);
      }
      // indexes right
      for (let cube = this.sideLength - 1; cube < cubes; cube += this.sideLength) {
        matrixRubic[sides.right].push(cube);
      }

      // indexes back and front
      const lastSide = this.sideLength * this.sideLength - this.sideLength;
      for (let slice = 0; slice < this.sideLength; slice += 1) {
        const start = slice * this.totalColors;
        const end = start + this.sideLength;
        for (let cube = start; cube < end; cube += 1) {
        // color back
          matrixRubic[sides.back].push(cube);
          // color front
          matrixRubic[sides.front].push(cube + lastSide);
        }
      }
      return matrixRubic;
    }

    rotate = (slices, sequence, slice) => {
      const layer = slices[slice];
      let first = layer[0];
      // save values of first face
      const firstFace = layer[0].map((i) => this.matrix[sequence[0]][i]);

      for (let face = 0; face < layer.length - 1; face += 1) {
        const second = layer[face + 1];
        for (let i = 0; i < layer[face].length; i += 1) {
          this.matrix[sequence[face]][first[i]] = this.matrix[sequence[face + 1]][second[i]];
        }
        first = second;
      }

      const lastFace = sequence[sequence.length - 2];
      for (let i = 0; i < layer[0].length; i += 1) {
        // matrix[lastFace][layer[lastFace][i]] = firstFace[i];
        this.matrix[lastFace][layer[3][i]] = firstFace[i];
      }
    }

    createEmptySlices() {
    // slices depending on a side length
      const slices = [];
      // slice
      for (let i = 0; i < this.sideLength; i += 1) {
        const slice = [];
        // 4 faces
        for (let face = 0; face < 4; face += 1) {
          const faces = [];
          slice.push(faces);
        }
        slices.push(slice);
      }
      return slices;
    }


    rotateFaceReal = (slice, bottom, top, clockwiseArr) => {
      if (slice === 0) {
        this.rotateFace(bottom, clockwiseArr);
        console.log('making face rotation');
      } else if (slice === this.sideLength - 1) {
        this.rotateFace(top, clockwiseArr);
        console.log('making face rotation');
      }
    }

    rotateFace = (face, positionFace) => {
      const faceCopy = [...this.matrix[face]];
      for (let i = 0; i < this.totalColors; i += 1) {
        this.matrix[face][i] = faceCopy[positionFace[i]];
      }
    }

    PositionFaceClockwise = () => {
      const clockwise = [];
      for (let i = 0; i < this.sideLength; i += 1) {
        for (let j = 0; j < this.sideLength; j += 1) {
          clockwise.push((this.sideLength - i - 1) + j * this.sideLength);
        }
      }
      return clockwise;
    }

    PositioinFaceAnticlockwise = () => {
      const anticlockwise = [];
      for (let i = 0; i < this.sideLength; i += 1) {
        for (let j = 0; j < this.sideLength; j += 1) {
          anticlockwise.push(i + (this.sideLength - 1 - j) * this.sideLength);
        }
      }
      return anticlockwise;
    }

    generatePositions = () => {
      this.posHor = this.createEmptySlices();
      this.posVer = this.createEmptySlices();
      this.posDep = this.createEmptySlices();

      for (let slice = 0; slice < this.posHor.length; slice += 1) {
        for (let m = 0; m < this.sideLength; m += 1) {
          // horizontal
          this.posHor[slice][0].push(slice * this.sideLength + m);
          this.posHor[slice][1].push(slice * this.sideLength + m);
          // vertical
          this.posVer[slice][0].push(slice + this.sideLength * m);
          this.posVer[slice][1].push(slice + this.sideLength * m);
          // depth
          this.posDep[slice][0].push(slice + this.sideLength * m);
          this.posDep[slice][1].push(slice * this.sideLength + m);
        }
        // horizontal
        const horCopy = [...this.posHor[slice][0]].reverse();
        this.posHor[slice][2] = horCopy;
        this.posHor[slice][3] = horCopy;
        // vertical
        const verCopy = [...this.posVer[slice][0]].reverse();
        this.posVer[slice][2] = verCopy;
        this.posVer[slice][3] = verCopy;
        // depth
        const depCopyOne = [...this.posDep[slice][0]].reverse();
        const depCopyTwo = [...this.posDep[slice][1]].reverse();
        this.posDep[slice][2] = depCopyOne;
        this.posDep[slice][3] = depCopyTwo;
      }

      this.posClockwise = [];
      this.posAnticlockwise = [];
      for (let i = 0; i < this.sideLength; i += 1) {
        for (let j = 0; j < this.sideLength; j += 1) {
          this.posClockwise.push((this.sideLength - i - 1) + j * this.sideLength);
          this.posAnticlockwise.push(i + (this.sideLength - 1 - j) * this.sideLength);
        }
      }
    }

    PositionHorizontal = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        for (let m = 0; m < this.sideLength; m += 1) {
          slices[slice][0].push(slice * this.sideLength + m);
          slices[slice][1].push(slice * this.sideLength + m);
        }
        const copy = [...slices[slice][0]].reverse();
        slices[slice][2] = copy;
        slices[slice][3] = copy;
      }
      return slices;
    }

    PositionVertical = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        for (let m = 0; m < this.sideLength; m += 1) {
          slices[slice][0].push(slice + this.sideLength * m);
          slices[slice][1].push(slice + this.sideLength * m);
        }
        const copy = [...slices[slice][0]].reverse();
        slices[slice][2] = copy;
        slices[slice][3] = copy;
      }
      return slices;
    }

    PositionDepth = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        for (let m = 0; m < this.sideLength; m += 1) {
          slices[slice][0].push(slice + this.sideLength * m);
          slices[slice][1].push(slice * this.sideLength + m);
        }
        const copyOne = [...slices[slice][0]].reverse();
        const copyTwo = [...slices[slice][1]].reverse();
        slices[slice][2] = copyOne;
        slices[slice][3] = copyTwo;
      }
      return slices;
    }
}


// every side length RIGHT
// every first in side length LEFT
// every second - middle vertical
// one side length BOTTOM, MIDDLE HOR, TOP
// from bottom to top
// from left to right
function createTurnRubik(sideLength) {
  const matrixRubic = [
    [2, 0, 0, 2, 0, 0, 2, 0, 0], // left
    [3, 1, 1, 3, 1, 1, 3, 1, 1], // right
    [1, 1, 1, 2, 2, 2, 2, 2, 2], // top
    [0, 0, 0, 3, 3, 3, 3, 3, 3], // bottom
    [4, 4, 4, 4, 4, 4, 4, 4, 4], // front
    [5, 5, 5, 5, 5, 5, 5, 5, 5], // back
  ];
  return matrixRubic;
}


function createOrderedByColor(sideLength) {
  const matrixRubic = [
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // left
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // right
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // top
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // bottom
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // front
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // back
  ];
  return matrixRubic;
}


// slices = [
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
// ]

export default RubikModel;
