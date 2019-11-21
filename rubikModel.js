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
    this.posDepRev = null;
    this.posClockwise = null;
    this.posAnticlockwise = null;
    this.generatePositions();
    this.colors = {
      green: 0,
      blue: 1,
      orange: 2,
      red: 3,
      white: 4,
      yellow: 5,
    };

    this.sequenceHor = [sides.front, sides.left, sides.back, sides.right, sides.front];
    this.sequenceVer = [sides.top, sides.back, sides.bottom, sides.front, sides.top];
    this.sequenceDep = [sides.left, sides.top, sides.right, sides.bottom, sides.left];
    this.sequenceHorRev = [sides.right, sides.back, sides.left, sides.front, sides.right];
    this.sequenceVerRev = [sides.front, sides.bottom, sides.back, sides.top, sides.front];
    this.sequenceDepRev = [sides.bottom, sides.right, sides.top, sides.left, sides.bottom];

    //   rotate(matrix, posVer, sequenceVert, 0);
    // this.rotate(this.posDep, this.sequenceDep, 0);
  }

  rotateVerCounter = (slice) => {
    this.rotate(this.posVer, this.sequenceVer, slice);
    this.rotateFaceReal(slice, sides.left, sides.right, this.posClockwise);
  }

  rotateHorCounter = (slice) => {
    this.rotate(this.posHor, this.sequenceHor, slice);
    this.rotateFaceReal(slice, sides.bottom, sides.top, this.posClockwise);
  }

  rotateDepCounter = (slice) => {
    this.rotate(this.posDep, this.sequenceDep, slice);
    this.rotateFaceReal(slice, sides.back, sides.front, this.posAnticlockwise);
  }


  rotateVer = (slice) => {
    this.rotate(this.posVer, this.sequenceVerRev, slice);
    this.rotateFaceReal(slice, sides.left, sides.right, this.posAnticlockwise);
  }

  rotateHor = (slice) => {
    this.rotate(this.posHor, this.sequenceHorRev, slice);
    this.rotateFaceReal(slice, sides.bottom, sides.top, this.posAnticlockwise);
  }

  rotateDep = (slice) => {
    this.rotate(this.posDepRev, this.sequenceDepRev, slice);
    this.rotateFaceReal(slice, sides.back, sides.front, this.posClockwise);
  }

  createInterface = () => {
    // left
    const left = [];
    for (let i = this.sideLength - 1; i >= 0; i -= 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        left.push(i + (j * this.sideLength));
      }
    }
    console.log(left);
    // right
    const right = [];
    for (let i = this.totalColors - 1; i > (this.totalColors - 1) - this.sideLength; i -= 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        right.push(i - (j * this.sideLength));
      }
    }
    console.log(right);
    // top
    const top = [];
    for (let i = this.sideLength * (this.sideLength - 1); i >= 0; i -= this.sideLength) {
      for (let j = 0; j < this.sideLength; j += 1) {
        top.push(i + j);
      }
    }
    console.log(top);
    // bottom
    const bottom = [];
    for (let i = this.totalColors - 1; i >= 0; i -= 1) {
      bottom.push(i);
    }
    console.log(bottom);
  }

  testGreenWhiteCross = () => {
    const testArr = [];
    const middle = Math.floor(this.sideLength / 2);

    const faceBottom = middle;
    const faceBottomRight = faceBottom + middle;
    const faceBottomLeft = faceBottom - middle;

    const faceMiddle = this.sideLength * middle + middle;
    const faceMiddleRight = faceMiddle + middle;
    const faceMiddleLeft = faceMiddle - middle;

    const faceTop = this.sideLength * (this.sideLength - 1) + middle;
    const faceTopRight = faceTop + middle;
    const faceTopLeft = faceTop - middle;

    if (this.matrix[sides.left][4] === this.colors.green
      && this.matrix[sides.left][5] === this.colors.green
      && this.matrix[sides.front][3] === this.colors.white) {
      console.log("Correct green white cross")
    } else {
      console.log("Wrong green white cross")
    }
  }

  getCubesHor = (slice) => this.getCubes(this.posHor, this.sequenceHor, slice, sides.bottom, sides.top);

  getCubesVer = (slice) => this.getCubes(this.posVer, this.sequenceVer, slice, sides.left, sides.right);

  getCubesDep = (slice) => this.getCubes(this.posDep, this.sequenceDep, slice, sides.back, sides.front);

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

  getCubes = (slices, sequence, slice, bottom, top) => {
    if (slice === 0) {
      return this.matrixReference[bottom];
    }

    if (slice === this.sideLength - 1) {
      return this.matrixReference[top];
    }


    const cubes = [];
    const layer = slices[slice];

    // get slice of every face except the last one
    for (let face = 0; face < layer.length; face += 1) {
      for (let i = 0; i < layer[face].length - 1; i += 1) {
        cubes.push(this.matrixReference[sequence[face]][layer[face][i]]);
      }
    }
    return cubes;
  }

  rotate = (slices, sequence, slice) => {
    const layer = slices[slice];
    let first = layer[0];
    // save values of first face
    const firstFace = layer[0].map((i) => this.matrix[sequence[0]][i]);
    const firstMatrixFace = layer[0].map((i) => this.matrixReference[sequence[0]][i]);

    for (let face = 0; face < layer.length - 1; face += 1) {
      const second = layer[face + 1];
      for (let i = 0; i < layer[face].length; i += 1) {
        this.matrix[sequence[face]][first[i]] = this.matrix[sequence[face + 1]][second[i]];
        this.matrixReference[sequence[face]][first[i]] = this.matrixReference[sequence[face + 1]][second[i]];
      }
      first = second;
    }

    const lastFace = sequence[sequence.length - 2];
    for (let i = 0; i < layer[0].length; i += 1) {
      // matrix[lastFace][layer[lastFace][i]] = firstFace[i];
      this.matrix[lastFace][layer[3][i]] = firstFace[i];
      this.matrixReference[lastFace][layer[3][i]] = firstMatrixFace[i];
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
      // console.log('making face rotation');
    } else if (slice === this.sideLength - 1) {
      this.rotateFace(top, clockwiseArr);
      // console.log('making face rotation');
    }
  }

  rotateFace = (face, positionFace) => {
    const faceCopy = [...this.matrix[face]];
    const faceMatrixCopy = [...this.matrixReference[face]];
    for (let i = 0; i < this.totalColors; i += 1) {
      this.matrix[face][i] = faceCopy[positionFace[i]];
      this.matrixReference[face][i] = faceMatrixCopy[positionFace[i]];
    }
  }

  generatePositions = () => {
    this.posHor = this.createEmptySlices();
    this.posVer = this.createEmptySlices();
    this.posDep = this.createEmptySlices();
    this.posDepRev = this.createEmptySlices();

    for (let slice = 0; slice < this.posHor.length; slice += 1) {
      for (let m = 0; m < this.sideLength; m += 1) {
        // set positions for first two faces
        // horizontal
        this.posHor[slice][0].push(slice * this.sideLength + m);
        this.posHor[slice][1].push(slice * this.sideLength + m);
        // vertical
        this.posVer[slice][0].push(slice + this.sideLength * m);
        this.posVer[slice][1].push(slice + this.sideLength * m);
        // depth
        this.posDep[slice][0].push(slice + this.sideLength * m);
        this.posDep[slice][1].push(slice * this.sideLength + m);
        // depth rev
        this.posDepRev[slice][0].push(slice * this.sideLength + m);
        this.posDepRev[slice][1].push(slice + this.sideLength * m);
      }
      // set positions for last two faces
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
      // depth
      const depRevCopyOne = [...this.posDepRev[slice][0]].reverse();
      const depRevCopyTwo = [...this.posDepRev[slice][1]].reverse();
      this.posDepRev[slice][2] = depRevCopyOne;
      this.posDepRev[slice][3] = depRevCopyTwo;
    }

    // for (let i = 0; i < this.posHor.length; i += 1) {
    //   const horCopy = [...this.posHor[i]].reverse();
    //   this.posHorRev.push(horCopy);
    //   const verCopy = [...this.posVer[i]].reverse();
    //   this.posVerRev.push(verCopy);
    //   const depCopy = [...this.posDep[i]].reverse();
    //   this.posDepRev.push(depCopy);
    // }
    // this.posHorRev = [...this.posHor].reverse()

    this.posClockwise = [];
    this.posAnticlockwise = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        this.posClockwise.push((this.sideLength - i - 1) + j * this.sideLength);
        this.posAnticlockwise.push(i + (this.sideLength - 1 - j) * this.sideLength);
      }
    }
  }

  createOrderedByColor = () => {
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
  // rotateGraphicalFaceReal = (slice, bottom, top, clockwiseArr) => {
  //   if (slice === 0) {
  //     this.rotateGraphicalFace(bottom, clockwiseArr);
  //     // console.log('making face rotation');
  //   } else if (slice === this.sideLength - 1) {
  //     this.rotateGraphicalFace(top, clockwiseArr);
  //     // console.log('making face rotation');
  //   }
  // }

  // rotateGraphicalFace = (face, positionFace) => {
  //   const faceCopy = [...this.matrixReference[face]];
  //   for (let i = 0; i < this.totalColors; i += 1) {
  //     this.matrixReference[face][i] = faceCopy[positionFace[i]];
  //   }
  // }

  // update reference matrix to rotation
  // rotateGraphical = (slices, sequence, slice) => {
  //   const layer = slices[slice];
  //   let first = layer[0];

  //   // save values of first face
  //   const firstFace = layer[0].map((i) => this.matrixReference[sequence[0]][i]);

  //   for (let face = 0; face < layer.length - 1; face += 1) {
  //     const second = layer[face + 1];
  //     for (let i = 0; i < layer[face].length; i += 1) {
  //       this.matrixReference[sequence[face]][first[i]] = this.matrixReference[sequence[face + 1]][second[i]];
  //     }
  //     first = second;
  //   }

  //   const lastFace = sequence[sequence.length - 2];
  //   for (let i = 0; i < layer[0].length; i += 1) {
  //     this.matrixReference[lastFace][layer[3][i]] = firstFace[i];
  //   }
  // }


  // rotateCubeVer = (slice) => {
  //   this.rotateGraphical(this.posVer, this.sequenceVerRev, slice);
  //   this.rotateGraphicalFaceReal(slice, sides.left, sides.right, this.posAnticlockwise);
  // }

  // rotateCubeHor = (slice) => {
  //   this.rotateGraphical(this.posHor, this.sequenceHorRev, slice);
  //   this.rotateGraphicalFaceReal(slice, sides.bottom, sides.top, this.posAnticlockwise);
  // }

  // rotateCubeDep = (slice) => {
  //   this.rotateGraphical(this.posDepRev, this.sequenceDepRev, slice);
  //   this.rotateGraphicalFaceReal(slice, sides.back, sides.front, this.posClockwise);
  // }
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
