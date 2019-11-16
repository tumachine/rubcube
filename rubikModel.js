import { sides } from './variables.js';

class RubikModel {
  constructor(sideLength) {
    this.sideLength = sideLength;
    this.totalColors = sideLength * sideLength;
    this.matrix = this.createMatrix();
    this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);


    this.posHor = this.PositionHorizontal();
    this.posVer = this.PositionVertical();
    this.posDep = this.PositionDepth();

    this.sequenceHor = [sides.front, sides.left, sides.back, sides.right, sides.front];
    this.sequenceVer = [sides.top, sides.back, sides.bottom, sides.front, sides.top];
    this.sequenceDep = [sides.left, sides.top, sides.right, sides.bottom, sides.left];

    //   rotate(matrix, posVer, sequenceVert, 0);
    // this.rotate(this.posDep, this.sequenceDep, 0);
  }

  rotateVer = (slice) => {
    this.rotate(this.posVer, this.sequenceVer, slice);
  }

  rotateHor = (slice) => {
    this.rotate(this.posHor, this.sequenceHor, slice);
  }

  rotateDep = (slice) => {
    this.rotate(this.posDep, this.sequenceDep, slice);
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
      console.log(matrixRubic)
      return matrixRubic;
    }

    rotate = (slices, sequence, slice) => {
      const layer = slices[slice];
      console.log(slices);
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
      //   console.log(lastFace)
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

    PositionHorizontal = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        const sliceStart = slice * this.sideLength;
        const sliceEnd = sliceStart + this.sideLength;
        for (let face = 0; face < slices[slice].length; face += 1) {
          for (let m = sliceStart; m < sliceEnd; m += 1) {
            slices[slice][face].push(m);
          }
        }
      }
      return slices;
    }

    PositionVertical = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        for (let face = 0; face < slices[slice].length; face += 1) {
          for (let m = 0; m < this.sideLength; m += 1) {
            slices[slice][face].push(slice + this.sideLength * m);
          }
        }
      }
      return slices;
    }

    PositionDepth = () => {
      const slices = this.createEmptySlices();
      for (let slice = 0; slice < slices.length; slice += 1) {
        // sideLength = 3
        // slice 0
        // [0, 3, 6]
        // second
        // [0, 1, 2]
        // first reversed
        // second reversed
        // slice 1
        // [1,4,7]
        // [3,4,5]
        // slice 2
        // [2,5,8]
        // [6,7,8]
        for (let m = 0; m < this.sideLength; m += 1) {
          slices[slice][0].push(slice + this.sideLength * m);
          slices[slice][1].push(slice * this.sideLength + m);
        }
        // slices[slice][2] = slices[slice][0].reverse();
        // slices[slice][3] = slices[slice][1].reverse();
        slices[slice][2] = slices[slice][0].reverse();
        slices[slice][3] = slices[slice][1].reverse();
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
