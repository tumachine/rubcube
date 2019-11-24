import { sides as s } from './variables.js';

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

    this.f = null;
    this.createInterfaceSides();

    this.colors = {
      green: 0,
      blue: 1,
      orange: 2,
      red: 3,
      white: 4,
      yellow: 5,
    };

    this.sequenceHor = [s.f, s.l, s.b, s.r, s.f];
    this.sequenceVer = [s.u, s.b, s.d, s.f, s.u];
    this.sequenceDep = [s.l, s.u, s.r, s.d, s.l];
    this.sequenceHorRev = [s.r, s.b, s.l, s.f, s.r];
    this.sequenceVerRev = [s.f, s.d, s.b, s.u, s.f];
    this.sequenceDepRev = [s.d, s.r, s.u, s.l, s.d];

    this.faceCases = [
      [],
      [],
      [],
      [],
    ];
    this.sideCases = [
      [],
      [],
      [],
      [],
    ];
    this.faceCornerCases = [
      [],
      [],
      [],
      [],
    ];

    this.generateFaceSideCases();

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

    this.frontOrient = [
      // left
      {
        U: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
      },
      // right
      {
        U: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
      },
      // up
      {
        U: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
      },
      // down
      {
        U: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
      },
    ];

    this.sideOrient = [
      // left
      {
        U: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
      },
      // right
      {
        U: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
      },
      // up
      {
        U: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
      },
      // down
      {
        U: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
        D: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
        L: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
        R: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
        F: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
        B: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
      },
    ];

    this.checkSequence = [s.l, s.u, s.r, s.d];
    this.colorHashes = [1, 10, 100, 1000, 10000, 100000];
  }

  solveWhiteCornerSide = (sc, fc) => {
    // check if already correct
    if (this.check(sc[0], this.f.dr, sc[0]) && (this.check(sc[1], this.f.dl, sc[1]) && (this.check(s.f, fc[0], s.f)))) {
      console.log('corner is in a right place');
      return;
    }

    // this
    // find cube where sum of the colors equals, sum of the desired cube
    // can check bottom and top with this solution
    let desiredSum = 0;
    desiredSum += this.colorHashes[sc[0]];
    desiredSum += this.colorHashes[sc[1]];
    desiredSum += this.colorHashes[s.f];
    // front
    let sum = 0;
    let frontFaceSide = null;
    for (let i = 0; i < 4; i += 1) {
      sum = 0;
      sum += this.getColorHash(sc[i], this.f.dr);
      sum += this.getColorHash(sc[(i + 1) % 4], this.f.dl);
      sum += this.getColorHash(s.f, fc[i]);
      if (sum === desiredSum) {
        frontFaceSide = i;

        break;
      }
    }

    if (frontFaceSide !== null) {
      this.sideOrient[sc[frontFaceSide]].R();
      this.sideOrient[sc[frontFaceSide]].U();
      this.sideOrient[sc[frontFaceSide]].R(0, false);

      if (frontFaceSide === 0) {
        this.moves.B(0, false);
      }
      if (frontFaceSide === 1) {
        // do nothing
      }
      if (frontFaceSide === 2) {
        this.moves.B();
      }
      if (frontFaceSide === 3) {
        this.moves.B();
        this.moves.B();
      }
    }


    // bottom
    let backFaceSide = null;
    if (frontFaceSide === null) {
      for (let i = 0; i < 4; i += 1) {
        sum = 0;
        sum += this.getColorHash(sc[i], this.f.ur);
        sum += this.getColorHash(sc[(i + 1) % 4], this.f.ul);
        sum += this.getColorHash(s.b, fc[i]);
        if (sum === desiredSum) {
          backFaceSide = i;
          break;
        }
      }
      if (backFaceSide === 0) {
        // do nothing
      }
      if (backFaceSide === 1) {
        this.moves.B();
      }
      if (backFaceSide === 2) {
        this.moves.B();
        this.moves.B();
      }
      if (backFaceSide === 3) {
        this.moves.B(0, false);
      }
    }

    // place it on the right side
    // for (let i = 0; i < 4; i += 1) {
    // there can now be only three cases, after putting
    // case 1: white to the right
    if (this.check(sc[0], this.f.ur, s.f) && (this.check(sc[1], this.f.ul, sc[1]))) {
      this.frontOrient[sc[1]].L(0, false);
      this.moves.B(0, false);
      this.frontOrient[sc[1]].L();
      console.log('solved case 1');
      return;
    }
    // case 2: white in the left
    if (this.check(sc[0], this.f.ur, sc[0]) && (this.check(sc[1], this.f.ul, s.f))) {
      this.frontOrient[sc[0]].R();
      this.moves.B();
      this.frontOrient[sc[0]].R(0, false);
      console.log('solved case 2');
      return;
    }
    // case 3: white in the bottom
    if (this.check(sc[0], this.f.ur, sc[1]) && (this.check(sc[1], this.f.ul, sc[0]))) {
      this.frontOrient[sc[1]].L(0, false);
      this.moves.B();
      this.moves.B();
      this.frontOrient[sc[1]].L();
      this.moves.B();

      this.frontOrient[sc[1]].L(0, false);
      this.moves.B(0, false);

      this.frontOrient[sc[1]].L();
      console.log('solved case 3');
      return;
    }

    // this.moves.B();
    // }
  }

  solveWhiteFace = (sca, fca) => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCornerSide(sca[i], fca[i]);
    }
  }

  solveWhiteCrossSide = (fc, sc) => {
    let count = 0;

    while (!(this.check(sc[0], this.f.d, sc[0]) && (this.check(s.f, fc[0], s.f)))) {
      // correct on left
      // need a simpler way to check colors
      // if (this.getColor(s.l, this.f.l) === s.l && this.getColor(s.d, this.f.r) === s.f) {
      // up, right, down, left
      if (this.check(sc[0], this.f.l, sc[0]) && this.check(sc[3], this.f.r, s.f)) {
        this.frontOrient[sc[0]].U(0, false);
        console.log('left left');
        return;
      }
      // correct on top
      if (this.check(sc[0], this.f.u, sc[0]) && this.check(s.b, fc[0], s.f)) {
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('left top');
        return;
      }

      // correct on right
      if (this.check(sc[0], this.f.r, sc[0]) && this.check(sc[1], this.f.l, s.f)) {
        this.frontOrient[sc[0]].U();
        console.log('left right');
        return;
      }

      // for reverse colors, move them to the right
      // left
      if (this.check(sc[0], this.f.l, s.f) && this.check(sc[3], this.f.r, sc[0])) {
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('reverse left left');
      } else if (this.check(sc[0], this.f.u, s.f) && this.check(s.b, fc[0], sc[0])) {
        // top
        this.frontOrient[sc[0]].U();
        console.log('reverse top left');
      } else if (this.check(sc[0], this.f.d, s.f) && this.check(s.f, fc[0], sc[0])) {
        // down
        this.frontOrient[sc[0]].U(0, false);
        console.log('reverse down left');
      }

      // solve reverse face case
      if (this.check(sc[0], this.f.r, s.f) && this.check(sc[1], this.f.l, sc[0])) {
        this.frontOrient[sc[1]].U();
        this.moves.B();
        this.frontOrient[sc[1]].U(0, false);
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('reverse face case');
        return;
      }

      // solve for top left
      if ((this.check(sc[2], this.f.l, sc[0]) && this.check(sc[1], this.f.r, s.f))
      || (this.check(sc[2], this.f.l, s.f) && this.check(sc[1], this.f.r, sc[0]))) {
        this.frontOrient[sc[0]].D();
        this.moves.B();
        this.frontOrient[sc[0]].D(0, false);
        this.moves.B();
        console.log('top hard side');
      }

      // solve for bottom left
      if ((this.check(sc[2], this.f.r, sc[0]) && this.check(sc[3], this.f.l, s.f))
      || (this.check(sc[2], this.f.r, s.f) && this.check(sc[3], this.f.l, sc[0]))) {
        this.frontOrient[sc[0]].L();
        this.moves.B();
        this.frontOrient[sc[0]].L(0, false);
        this.moves.B();
        console.log('bottom hard side');
      }

      // solve for face top
      if ((this.check(sc[1], this.f.d, sc[0]) && this.check(s.f, fc[1], s.f))
      || (this.check(sc[1], this.f.d, s.f) && this.check(s.f, fc[1], sc[0]))) {
        this.frontOrient[sc[0]].R();
        this.frontOrient[sc[0]].R();
        console.log('front top hard face');
      }

      // solve for face right
      if ((this.check(sc[2], this.f.d, sc[0]) && this.check(s.f, fc[2], s.f))
      || (this.check(sc[2], this.f.d, s.f) && this.check(s.f, fc[2], sc[0]))) {
        this.frontOrient[sc[0]].D();
        this.frontOrient[sc[0]].D();
        console.log('front right hard face');
      }

      // solve for face bottom
      if ((this.check(sc[3], this.f.d, sc[0]) && this.check(s.f, fc[3], s.f))
      || (this.check(sc[3], this.f.d, s.f) && this.check(s.f, fc[3], sc[0]))) {
        this.frontOrient[sc[0]].L();
        this.frontOrient[sc[0]].L();
        console.log('front bottom hard face');
      }

      // this solves another three cases for bottom
      this.moves.B();

      console.log('solving')

      if (count === 10) {
        break;
      }
      count += 1;
    }
  }

  solve = () => {
    this.solveWhiteCross();
    // const correctFaces = this.moveFrontCornersToBackIfWhite(this.faceCornerCases, this.sideCases);
    // console.log(correctFaces);
    this.solveWhiteFace(this.sideCases, this.faceCornerCases);
    // this.solveMiddleLayerCorrectInitialPosition();
    this.solveMiddleLayer();
  }

  check = (side, face, color) => this.getColor(side, face) === color;

  solveMiddleLayerLeftCase = (orientation) => {
    // U' L' U L U F U' F'
    // left
    orientation.U(0, false);
    orientation.L(0, false);
    orientation.U();
    orientation.L();
    orientation.U();
    orientation.F();
    orientation.U(0, false);
    orientation.F(0, false);
    console.log('Middle case LEFT');
  }

  solveMiddleLayerRightCase = (orientation) => {
    // U R U' R' U' F' U F
    // right
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.F(0, false);
    orientation.U();
    orientation.F();
    console.log('Middle case RIGHT');
  }

  solveMiddleLayerSide = (fc, sc) => {
    // rotate until color is the same, and
    // depending on the second color, use algorithm

    // three cases for back side with back rotations, determine number of back rotations
    // check for right side
    // create a check if a side already correct
    if (this.check(sc[0], this.f.r, sc[0]) && (this.check(sc[1], this.f.l, sc[1]))) {
      console.log('middle layer side already correct');
      // already correct
      return;
    }

    // cube is in the middle
    // move it to top
    for (let i = 0; i < 4; i += 1) {
      if (this.check(sc[i], this.f.r, sc[1]) && this.check(sc[(i + 1) % 4], this.f.l, sc[0])) {
        console.log('middle opposite', i);
        this.solveMiddleLayerRightCase(this.sideOrient[sc[i]]);
        if (i === 0) {
          this.moves.B();
          this.moves.B();
        } else if (i === 1) {
          this.moves.B(0, false);
        } else if (i === 2) {
          // do nothing
        } else if (i === 3) {
          this.moves.B();
        }
        this.solveMiddleLayerRightCase(this.sideOrient[sc[0]]);
        break;
      }
      if (this.check(sc[i], this.f.r, sc[0]) && this.check(sc[(i + 1) % 4], this.f.l, sc[1])) {
        console.log('middle same ', i);
        this.solveMiddleLayerRightCase(this.sideOrient[sc[i]]);
        if (i === 0) {
          this.moves.B();
        } if (i === 1) {
          this.moves.B();
          this.moves.B();
        } else if (i === 2) {
          this.moves.B(0, false);
        } else if (i === 3) {
          // do nothing
        }
        this.solveMiddleLayerLeftCase(this.sideOrient[sc[1]]);
        // this.solveMiddleLayerRightCase(this.sideOrient[sc[i]]);
        break;
      }

      if (this.check(sc[i], this.f.u, sc[0]) && this.check(s.b, fc[i], sc[1])) {
        console.log('top same', i);
        if (i === 0) {
          // do nothing
        } else if (i === 1) {
          this.moves.B();
        } else if (i === 2) {
          this.moves.B();
          this.moves.B();
        } else if (i === 3) {
          this.moves.B(0, false);
        }
        this.solveMiddleLayerRightCase(this.sideOrient[sc[0]]);
        break;
      }

      if (this.check(sc[i], this.f.u, sc[1]) && this.check(s.b, fc[i], sc[0])) {
        console.log('top opposite', i);
        if (i === 0) {
          this.moves.B(0, false);
        } else if (i === 1) {
          // do nothing
        } else if (i === 2) {
          this.moves.B(0, false);
        } else if (i === 3) {
          // do nothing
          this.moves.B();
          this.moves.B();
        }
        this.solveMiddleLayerLeftCase(this.sideOrient[sc[1]]);
        break;
      }
    }
  }

  solveMiddleLayer = () => {
    console.log('solving middle layer');
    for (let i = 0; i < 4; i += 1) {
      this.solveMiddleLayerSide(this.faceCases[i], this.sideCases[i]);
      // console.log(i + 1);
    }
  }

  solveWhiteCross = () => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCrossSide(this.faceCases[i], this.sideCases[i]);
      // console.log(i + 1);
    }
  }

  generateFaceSideCases = () => {
    // need an array for FCA = [this.f.ul, this.f.ur, this.f.dr, this.f.dl]
    const leftFaceCases = [this.f.l, this.f.u, this.f.r, this.f.d];
    const leftSideCases = [s.l, s.u, s.r, s.d];
    const leftFaceCornerCases = [this.f.ul, this.f.ur, this.f.dr, this.f.dl];
    for (let i = 0; i < 4; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        this.faceCases[i][j] = leftFaceCases[(j + i) % 4];
        this.sideCases[i][j] = leftSideCases[(j + i) % 4];
        this.faceCornerCases[i][j] = leftFaceCornerCases[(j + i) % 4];
      }
    }
    console.log(this.faceCases);
    console.log(this.sideCases);
    console.log(this.faceCornerCases);
  }

  testGreenWhiteCross = () => {
    if (this.getColor(s.l, this.f.d) === s.l
      // && this.getColor(sides.left, this.interfaceSides.middle) === sides.left
      && this.getColor(s.f, this.f.l) === s.f) {
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

  generateMoves = () => {
    // this.moves.U();
    // this.moves.F
  }

  generateRandomMoves = (num) => {
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const funcs = [
      this.moves.D,
      this.moves.U,
      this.moves.F,
      this.moves.B,
      this.moves.L,
      this.moves.R,
    ];

    for (let i = 0; i < num; i += 1) {
      const clockwise = randomInt(0, 1) === 0;
      funcs[randomInt(0, funcs.length - 1)](0, clockwise);
    }
  }

  regMove = (side, slice, clockwise, rotation) => {
    this.moveHistory.push({
      side, slice, clockwise, rotation,
    });
    rotation(slice, clockwise, this.matrix);
    // this.testWhiteCross();
  }


  rotateVer = (slice, clockwise, matrix) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, s.l, s.r, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  rotateHor = (slice, clockwise, matrix) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, matrix);
    this.rotateFaceReal(slice, s.d, s.u, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  rotateDep = (slice, clockwise, matrix) => {
    this.rotate(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice, matrix);
    this.rotateFaceReal(slice, s.b, s.f, clockwise ? this.posClockwise : this.posCounter, matrix);
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
    this.interface[s.l] = left;
    this.interface[s.r] = right;
    this.interface[s.u] = up;
    this.interface[s.d] = down;
    this.interface[s.f] = frontAndBack;
    this.interface[s.b] = frontAndBack;
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

    this.f = {
      d: faceDown,
      dr: faceDownRight,
      dl: faceDownLeft,

      m: faceMiddle,
      r: faceMiddleRight,
      l: faceMiddleLeft,

      u: faceUp,
      ur: faceUpRight,
      ul: faceUpLeft,
    };
  }


  // getColor(sides.left, this.interfaceSides.bottom)
  getColor = (side, direction) => this.matrix[side][this.interface[side][direction]];

  getColorHash = (side, direction) => this.colorHashes[this.getColor(side, direction)];

  getCubesHor = (slice) => this.getCubes(this.posHor, this.sequenceHor, slice, s.d, s.u);

  getCubesVer = (slice) => this.getCubes(this.posVer, this.sequenceVer, slice, s.l, s.r);

  getCubesDep = (slice) => this.getCubes(this.posDep, this.sequenceDep, slice, s.b, s.f);

  createMatrix = () => {
    const totalColors = this.sideLength * this.sideLength;
    const matrixRubic = [];
    // 6 rubik has sides
    for (let i = 0; i < 6; i += 1) {
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
      matrixRubic[s.d].push(cube);
    }

    // indexes top
    for (let cube = cubes - this.totalColors; cube < cubes; cube += 1) {
      matrixRubic[s.u].push(cube);
    }

    // indexes left
    for (let cube = 0; cube < cubes; cube += this.sideLength) {
      matrixRubic[s.l].push(cube);
    }
    // indexes right
    for (let cube = this.sideLength - 1; cube < cubes; cube += this.sideLength) {
      matrixRubic[s.r].push(cube);
    }

    // indexes back and front
    const lastSide = this.sideLength * this.sideLength - this.sideLength;
    for (let slice = 0; slice < this.sideLength; slice += 1) {
      const start = slice * this.totalColors;
      const end = start + this.sideLength;
      for (let cube = start; cube < end; cube += 1) {
      // color back
        matrixRubic[s.b].push(cube);
        // color front
        matrixRubic[s.f].push(cube + lastSide);
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

  rotate = (slices, sequence, slice, matrix) => {
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

  rotateFaceReal = (slice, bottom, top, clockwiseArr, matrix) => {
    if (slice === 0) {
      this.rotateFace(bottom, clockwiseArr, matrix);
      // console.log('making face rotation');
    } else if (slice === this.sideLength - 1) {
      this.rotateFace(top, clockwiseArr, matrix);
      // console.log('making face rotation');
    }
  }

  // keep matrix and reference separated
  // ref update is unnesesary unless you have a rubik model
  rotateFace = (face, positionFace, matrix) => {
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
