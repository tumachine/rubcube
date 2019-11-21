import { sides } from './variables.js';

class RubikModel {
  constructor(sideLength) {
    this.sideLength = sideLength;
    this.totalColors = sideLength * sideLength;
    this.matrix = this.createMatrix();
    this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);

    this.posHor = null;
    this.posVer = null;
    this.posDep = null;
    this.posDepRev = null;
    this.posClockwise = null;
    this.posCounter = null;
    this.generatePositions();

    this.interface = null;
    this.createInterface();

    this.interfaceSides = null;
    this.createInterfaceSides();

    this.colors = {
      green: 0,
      blue: 1,
      orange: 2,
      red: 3,
      white: 4,
      yellow: 5,
    };

    this.sequenceHor = [sides.front, sides.left, sides.back, sides.right, sides.front];
    this.sequenceVer = [sides.up, sides.back, sides.down, sides.front, sides.up];
    this.sequenceDep = [sides.left, sides.up, sides.right, sides.down, sides.left];
    this.sequenceHorRev = [sides.right, sides.back, sides.left, sides.front, sides.right];
    this.sequenceVerRev = [sides.front, sides.down, sides.back, sides.up, sides.front];
    this.sequenceDepRev = [sides.down, sides.right, sides.up, sides.left, sides.down];

    this.moveHistory = [];

    // these are moves for top
    // F and B can be use everywhere
    // need way to register move
    // surround with new function
    this.moves = {
      // L: (clockwise = true, slice = 0) => this.rotateVer(0 + slice, !clockwise),
      L: (slice = 0, clockwise = true) => this.regMove('L', 0 + slice, !clockwise, this.rotateVer),
      R: (slice = 0, clockwise = true) => this.regMove('R', this.sideLength - 1 - slice, clockwise, this.rotateVer),
      U: (slice = 0, clockwise = true) => this.regMove('U', this.sideLength - 1 - slice, clockwise, this.rotateHor),
      D: (slice = 0, clockwise = true) => this.regMove('D', 0 + slice, !clockwise, this.rotateHor),
      F: (slice = 0, clockwise = true) => this.regMove('F', this.sideLength - 1 - slice, clockwise, this.rotateDep),
      B: (slice = 0, clockwise = true) => this.regMove('B', 0 + slice, !clockwise, this.rotateDep),
    };

    const right = {
      U: (slice = 0) => this.moves.R(slice),
      D: (slice = 0) => this.moves.L(slice),
      L: (slice = 0) => this.moves.U(slice, false),
      R: (slice = 0) => this.moves.D(slice, false),
    };

    const down = {
      U: (slice = 0) => this.moves.D(slice, false),
      D: (slice = 0) => this.moves.U(slice, false),
      L: (slice = 0) => this.moves.R(slice, false),
      R: (slice = 0) => this.moves.L(slice, false),
    };

    const left = {
      U: (slice = 0) => this.moves.L(slice, false),
      D: (slice = 0) => this.moves.R(slice, false),
      L: (slice = 0) => this.moves.D(slice),
      R: (slice = 0) => this.moves.U(slice),
    };
  }

  generateMoves = () => {
    this.moves.F
  }

  regMove = (side, slice, clockwise, rotation) => {
    this.moveHistory.push({ side, slice, clockwise });
    rotation(slice, rotation);
    console.log(side, slice, clockwise);
  }

  rotateVer = (slice, clockwise) => {
    this.rotateMat(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice);
    this.rotateFaceRealMat(slice, sides.left, sides.right, clockwise ? this.posCounter : this.posClockwise);
  }

  rotateHor = (slice, clockwise) => {
    this.rotateMat(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice);
    this.rotateFaceRealMat(slice, sides.down, sides.up, clockwise ? this.posCounter : this.posClockwise);
  }

  rotateDep = (slice, clockwise) => {
    this.rotateMat(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice);
    this.rotateFaceRealMat(slice, sides.back, sides.front, clockwise ? this.posClockwise : this.posCounter);
  }


  rotateVerRef = (slice, clockwise) => {
    this.rotateRef(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice);
    this.rotateFaceRealRef(slice, sides.left, sides.right, clockwise ? this.posCounter : this.posClockwise);
  }

  rotateHorRef = (slice, clockwise) => {
    this.rotateRef(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice);
    this.rotateFaceRealRef(slice, sides.down, sides.up, clockwise ? this.posCounter : this.posClockwise);
  }

  rotateDepRef = (slice, clockwise) => {
    this.rotateRef(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice);
    this.rotateFaceRealRef(slice, sides.back, sides.front, clockwise ? this.posClockwise : this.posCounter);
  }

  createInterface = () => {
    this.interface = [
      [], // left
      [], // right
      [], // top
      [], // bottom
      [], // front
      [], // back
    ];

    // left
    const left = [];
    for (let i = this.sideLength - 1; i >= 0; i -= 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        left.push(i + (j * this.sideLength));
      }
    }
    // right
    const right = [];
    for (let i = this.totalColors - 1; i > (this.totalColors - 1) - this.sideLength; i -= 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        right.push(i - (j * this.sideLength));
      }
    }
    // top
    const up = [];
    for (let i = this.sideLength * (this.sideLength - 1); i >= 0; i -= this.sideLength) {
      for (let j = 0; j < this.sideLength; j += 1) {
        up.push(i + j);
      }
    }
    // bottom
    const down = [];
    for (let i = this.totalColors - 1; i >= 0; i -= 1) {
      down.push(i);
    }
    // front
    const frontAndBack = [];
    for (let i = 0; i < this.totalColors; i += 1) {
      frontAndBack.push(i);
    }
    this.interface[sides.left] = left;
    this.interface[sides.right] = right;
    this.interface[sides.up] = up;
    this.interface[sides.down] = down;
    this.interface[sides.front] = frontAndBack;
    this.interface[sides.back] = frontAndBack;
  }

  createInterfaceSides = () => {
    const middle = Math.floor(this.sideLength / 2);

    const faceDown = middle;
    const faceDownRight = faceDown + middle;
    const faceDownLeft = faceDown - middle;

    const faceMiddle = this.sideLength * middle + middle;
    const faceMiddleRight = faceMiddle + middle;
    const faceMiddleLeft = faceMiddle - middle;

    const faceUp = this.sideLength * (this.sideLength - 1) + middle;
    const faceUpRight = faceUp + middle;
    const faceUpLeft = faceUp - middle;

    this.interfaceSides = {
      down: faceDown,
      downRight: faceDownRight,
      downLeft: faceDownLeft,

      middle: faceMiddle,
      right: faceMiddleRight,
      left: faceMiddleLeft,

      up: faceUp,
      upRight: faceUpRight,
      upLeft: faceUpLeft,
    };
  }

  testWhiteCross = () => {
    const intSides = [this.interfaceSides.left, this.interfaceSides.up, this.interfaceSides.right, this.interfaceSides.down];
    const consSides = [sides.left, sides.up, sides.right, sides.down];
    for (let i = 0; i < 4; i += 1) {
      if (this.getColor(consSides[i], this.interfaceSides.down) === consSides[i]
        && this.getColor(sides.front, intSides[i]) === sides.front) {
        console.log('Correct green white cross');
      } else {
        console.log('Wrong green white cross');
      }
    }
  }

  testGreenWhiteCross = () => {
    if (this.getColor(sides.left, this.interfaceSides.down) === sides.left
      // && this.getColor(sides.left, this.interfaceSides.middle) === sides.left
      && this.getColor(sides.front, this.interfaceSides.left) === sides.front) {
      console.log('Correct green white cross');
    } else {
      console.log('Wrong green white cross');
    }


    // if (this.matrix[sides.left][4] === this.colors.green
    //   && this.matrix[sides.left][5] === this.colors.green
    //   && this.matrix[sides.front][3] === this.colors.white) {
    //   console.log("Correct green white cross")
    // } else {
    //   console.log("Wrong green white cross")
    // }
  }

  // getColor(sides.left, this.interfaceSides.bottom)
  getColor = (side, direction) => this.matrix[side][this.interface[side][direction]];

  getCubesHor = (slice) => this.getCubes(this.posHor, this.sequenceHor, slice, sides.down, sides.up);

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
      matrixRubic[sides.down].push(cube);
    }

    // indexes top
    for (let cube = cubes - this.totalColors; cube < cubes; cube += 1) {
      matrixRubic[sides.up].push(cube);
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

  rotateRef = (slices, sequence, slice) => {
    this.rotateFunc(slices, sequence, slice, this.matrixReference);
  }

  rotateMat = (slices, sequence, slice) => {
    this.rotateFunc(slices, sequence, slice, this.matrix);
  }

  rotateFunc = (slices, sequence, slice, matrix) => {
    const layer = slices[slice];
    let first = layer[0];
    // save values of first face
    const firstFace = layer[0].map((i) => matrix[sequence[0]][i]);

    for (let face = 0; face < layer.length - 1; face += 1) {
      const second = layer[face + 1];
      for (let i = 0; i < layer[face].length; i += 1) {
        matrix[sequence[face]][first[i]] = matrix[sequence[face + 1]][second[i]];
      }
      first = second;
    }

    const lastFace = sequence[sequence.length - 2];
    for (let i = 0; i < layer[0].length; i += 1) {
      // matrix[lastFace][layer[lastFace][i]] = firstFace[i];
      matrix[lastFace][layer[3][i]] = firstFace[i];
    }
  }

  // keep matrix and reference separated
  // rotateFunc = (slices, sequence, slice) => {
  //   const layer = slices[slice];
  //   let first = layer[0];
  //   // save values of first face
  //   const firstFace = layer[0].map((i) => this.matrix[sequence[0]][i]);
  //   const firstMatrixFace = layer[0].map((i) => this.matrixReference[sequence[0]][i]);

  //   for (let face = 0; face < layer.length - 1; face += 1) {
  //     const second = layer[face + 1];
  //     for (let i = 0; i < layer[face].length; i += 1) {
  //       this.matrix[sequence[face]][first[i]] = this.matrix[sequence[face + 1]][second[i]];
  //       this.matrixReference[sequence[face]][first[i]] = this.matrixReference[sequence[face + 1]][second[i]];
  //     }
  //     first = second;
  //   }

  //   const lastFace = sequence[sequence.length - 2];
  //   for (let i = 0; i < layer[0].length; i += 1) {
  //     // matrix[lastFace][layer[lastFace][i]] = firstFace[i];
  //     this.matrix[lastFace][layer[3][i]] = firstFace[i];
  //     this.matrixReference[lastFace][layer[3][i]] = firstMatrixFace[i];
  //   }
  // }

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

  rotateFaceRealRef = (slice, bottom, top, clockwiseArr) => {
    this.rotateFaceRealFunc(slice, bottom, top, clockwiseArr, this.rotateFaceRef);
  }

  rotateFaceRealMat = (slice, bottom, top, clockwiseArr) => {
    this.rotateFaceRealFunc(slice, bottom, top, clockwiseArr, this.rotateFaceMat);
  }

  rotateFaceRealFunc = (slice, bottom, top, clockwiseArr, func) => {
    if (slice === 0) {
      func(bottom, clockwiseArr);
      // console.log('making face rotation');
    } else if (slice === this.sideLength - 1) {
      func(top, clockwiseArr);
      // console.log('making face rotation');
    }
  }

  rotateFaceRef = (face, positionFace) => {
    this.rotateFaceFunc(face, positionFace, this.matrixReference);
  }

  rotateFaceMat = (face, positionFace) => {
    this.rotateFaceFunc(face, positionFace, this.matrix);
  }

  // keep matrix and reference separated
  // ref update is unnesesary unless you have a rubik model
  rotateFaceFunc = (face, positionFace, matrix) => {
    const faceCopy = [...matrix[face]];
    for (let i = 0; i < this.totalColors; i += 1) {
      matrix[face][i] = faceCopy[positionFace[i]];
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
    this.posCounter = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        this.posClockwise.push((this.sideLength - i - 1) + j * this.sideLength);
        this.posCounter.push(i + (this.sideLength - 1 - j) * this.sideLength);
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
