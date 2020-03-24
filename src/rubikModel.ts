import { sides as s, sides } from './variables.js';

class Move {
  public side: string
  public slice: number
  public clockwise: boolean 
  public rotation: RotateInterface

  public constructor(side: string, slice: number, clockwise: boolean, rotation: RotateInterface) {
    this.side = side
    this.slice = slice
    this.clockwise = clockwise
    this.rotation = rotation
  }

  public rotate(matrix: Matrix) {
    this.rotation(this.slice, this.clockwise, matrix);
  }
}

class MoveActions {
    L: MoveInterface
    R: MoveInterface
    U: MoveInterface
    D: MoveInterface
    F: MoveInterface
    B: MoveInterface
}

type Matrix = Array<Array<number>>
type Slices = Array<Array<Array<number>>>

interface MoveInterface {
  (slice?: number, clockwise?: boolean): void
}

interface RotateInterface {
  (slice: number, clockwise: boolean, matrix: Array<Array<number>>)
}

class Face {
  public d: number
  public dr: number
  public dl: number

  public m: number
  public r: number
  public l: number

  public u: number
  public ur: number
  public ul: number


  public constructor(sideLength: number) {
    const faceDown = 1;
    const faceDownRight = sideLength - 1;
    const faceDownLeft = 0;

    const faceMiddle = sideLength + 1;
    const faceMiddleRight = (sideLength * 2) - 1;
    const faceMiddleLeft = sideLength;

    const faceUp = (sideLength * sideLength) - sideLength + 1;
    const faceUpRight = (sideLength * sideLength) - 1;
    const faceUpLeft = (sideLength * sideLength) - sideLength;

    this.d = faceDown
    this.dr = faceDownRight
    this.dl = faceDownLeft

    this.m = faceMiddle
    this.r = faceMiddleRight
    this.l = faceMiddleLeft

    this.u = faceUp
    this.ur = faceUpRight
    this.ul = faceUpLeft
  }
}

class RubikModel {
  private posHor: Array<Array<Array<number>>>
  private posVer: Array<Array<Array<number>>>
  private posDep: Array<Array<Array<number>>>
  private posDepRev: Array<Array<Array<number>>>

  private posClockwise: Array<number>
  private posCounter: Array<number>

  // hashes for correctly identifying color combinations on a cube
  private colorHashes: Array<number> = [1, 10, 100, 1000, 10000, 100000]

  private faceCases: Array<Array<number>> = [[], [], [], []]
  private sideCases: Array<Array<number>> = [[], [], [], []]
  private faceCornerCases: Array<Array<number>> = [[], [], [], []]

  public sideLength: number
  private totalColors: number
  private matrix: Array<Array<number>>
  private matrixReference: Array<Array<number>>
  private interface: Array<Array<number>>

  private f: Face

  private sequenceHor: Array<number> = [s.f, s.l, s.b, s.r, s.f];
  private sequenceVer: Array<number> = [s.u, s.b, s.d, s.f, s.u];
  private sequenceDep: Array<number> = [s.l, s.u, s.r, s.d, s.l];
  private sequenceHorRev: Array<number> = [s.r, s.b, s.l, s.f, s.r];
  private sequenceVerRev: Array<number> = [s.f, s.d, s.b, s.u, s.f];
  private sequenceDepRev: Array<number> = [s.d, s.r, s.u, s.l, s.d];

  private moveHistory: Array<Move>
  private moves: MoveActions
  private frontOrient: Array<MoveActions>
  private sideOrient: Array<MoveActions>

  private stRotations: Array<Array<number>>
  private opRotations: Array<Array<number>>

  public constructor(sideLength: number) {
    this.sideLength = sideLength
    this.totalColors = sideLength * sideLength;
    this.matrix = this.createMatrix();


    this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);

    this.generatePositions();

    this.createInterface();

    this.f = new Face(sideLength)

    this.generateFaceSideCases();

    this.moveHistory = [];

    this.moves.L = (slice = 0, clockwise = true) => this.regMove(new Move('L', 0 + slice, !clockwise, this.rotateVer))
    this.moves.R = (slice = 0, clockwise = true) => this.regMove(new Move('R', this.sideLength - 1 - slice, clockwise, this.rotateVer))
    this.moves.U = (slice = 0, clockwise = true) => this.regMove(new Move('U', this.sideLength - 1 - slice, clockwise, this.rotateHor))
    this.moves.D = (slice = 0, clockwise = true) => this.regMove(new Move('D', 0 + slice, !clockwise, this.rotateHor))
    this.moves.F = (slice = 0, clockwise = true) => this.regMove(new Move('F', this.sideLength - 1 - slice, clockwise, this.rotateDep))
    this.moves.B = (slice = 0, clockwise = true) => this.regMove(new Move('B', 0 + slice, !clockwise, this.rotateDep))

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
  }

  private generateFaceSideCases = () => {
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
  }


  public generateRandomMoves = (num, randomSlices = false) => {
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
    if (randomSlices === true) {
      for (let i = 0; i < num; i += 1) {
        const clockwise = randomInt(0, 1) === 0;
        // random moves should not move center slices
        const slice = randomInt(0, Math.floor(this.sideLength / 2) - 1);
        funcs[randomInt(0, funcs.length - 1)](slice, clockwise);
      }
    } else {
      for (let i = 0; i < num; i += 1) {
        const clockwise = randomInt(0, 1) === 0;
        funcs[randomInt(0, funcs.length - 1)](0, clockwise);
      }
    }
  }

  regMove = (m: Move) => {
    this.moveHistory.push(m);
    m.rotation(slice, clockwise, this.matrix);
    // this.testWhiteCross();
  }

  private rotateVerAlt = (slice, clockwise, makrix) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, s.l, s.r, clockwise ? this.posCounter : this.posClockwise, matrix);
  }


  private rotateVer = (slice, clockwise, matrix) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, s.l, s.r, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateHor = (slice, clockwise, matrix) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, matrix);
    this.rotateFaceReal(slice, s.d, s.u, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateDep = (slice, clockwise, matrix) => {
    this.rotate(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice, matrix);
    this.rotateFaceReal(slice, s.b, s.f, clockwise ? this.posClockwise : this.posCounter, matrix);
  }

  private createInterface = () => {
    this.interface = [
      [], // left
      [], // right
      [], // top
      [], // bottom
      [], // front
      [], // back
    ];

    // there are four different positions of standard when rotated
    const standard = [];
    for (let i = 0; i < this.totalColors; i += 1) {
      standard.push(i);
    }

    const opposite = [];
    for (let i = this.sideLength - 1; i < this.totalColors; i += this.sideLength) {
      for (let j = 0; j < this.sideLength; j += 1) {
        opposite.push(i - j);
      }
    }

    this.stRotations = [
      standard,
      [],
      [],
      [],
    ];

    this.opRotations = [
      opposite,
      [],
      [],
      [],
    ];

    // this way is more efficient, than generating arrays by hand
    // for each position, we can create custom interface
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < this.totalColors; j += 1) {
        this.stRotations[i + 1].push(this.stRotations[i][this.posCounter[j]]);
        this.opRotations[i + 1].push(this.opRotations[i][this.posClockwise[j]]);
      }
    }

    // console.log(back)
    // this.interface[s.l] = left;
    // this.interface[s.r] = right;
    // this.interface[s.u] = up;
    // this.interface[s.d] = down;
    // this.interface[s.f] = front;
    // this.interface[s.b] = front;

    // this.interface[s.b] = back;
    this.interface[s.l] = [...this.stRotations[3]];
    this.interface[s.r] = [...this.opRotations[3]];
    this.interface[s.u] = [...this.opRotations[2]];
    this.interface[s.d] = [...this.stRotations[2]];
    this.interface[s.f] = [...this.stRotations[0]];
    this.interface[s.b] = [...this.stRotations[0]];
  }

  

  public check = (side: number, face: number, color: number): boolean => this.getColor(side, face) === color;

  public getColor = (side: number, direction: number): number => this.matrix[side][this.interface[side][direction]];

  public getColorHash = (side: number, direction: number): number => this.colorHashes[this.getColor(side, direction)];

  public getCubesHor = (slice): Array<number> => this.getCubes(this.posHor, this.sequenceHor, slice, s.d, s.u);

  public getCubesVer = (slice): Array<number> => this.getCubes(this.posVer, this.sequenceVer, slice, s.l, s.r);

  public getCubesDep = (slice): Array<number> => this.getCubes(this.posDep, this.sequenceDep, slice, s.b, s.f);

  private createMatrix = (): Matrix => {
    const totalColors: number = this.sideLength * this.sideLength;
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

  private createMatrixReference = (cubes: number): Matrix => {
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

  public getCubes = (slices: Slices, sequence: Array<number>, slice: number, bottom: number, top: number): Array<number> => {
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

  private rotate = (slices: Slices, sequence: Array<number>, slice: number, matrix: Matrix) => {
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

  private createEmptySlices(): Slices {
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

  private rotateFaceReal = (slice: number, bottom: number, top: number, clockwiseArr: Array<number>, matrix: Matrix) => {
    if (slice === 0) {
      this.rotateFace(bottom, clockwiseArr, matrix);
    } else if (slice === this.sideLength - 1) {
      this.rotateFace(top, clockwiseArr, matrix);
    }
  }

  // keep matrix and reference separated
  // ref update is unnesesary unless you have a rubik model
  private rotateFace = (face: number, positionFace: Array<number>, matrix: Matrix) => {
    const faceCopy = [...matrix[face]];
    for (let i = 0; i < this.totalColors; i += 1) {
      matrix[face][i] = faceCopy[positionFace[i]];
    }
  }

  private generatePositions = () => {
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

    this.posClockwise = [];
    this.posCounter = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      for (let j = 0; j < this.sideLength; j += 1) {
        this.posClockwise.push((this.sideLength - i - 1) + j * this.sideLength);
        this.posCounter.push(i + (this.sideLength - 1 - j) * this.sideLength);
      }
    }
  }

  solveWhiteCornerSide = (sc: number[], fc: number[]) => {
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
    }
  }

  solveWhiteFace = (sca: number[][], fca: number[][]) => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCornerSide(sca[i], fca[i]);
    }
  }

  solveWhiteCrossSide = (fc: number[], sc: number[]) => {
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

      console.log('solving');

      if (count === 10) {
        break;
      }
      count += 1;
    }
  }

  solveBigCube = () => {
    // first finish white face
    // this.solveWhiteCenter();
    this.solveWhiteCenter();
    this.solveYellowCenter();
  }

  baseFind = (row: number, column: number, side: number, color: number, operation: Function, localCheck: Function): boolean => {
    let nextPos = this.getFaceDirection(row, column);
    const origPos = nextPos;
    for (let i = 0; i < 4; i += 1) {
      const currentRow = Math.floor(nextPos / this.sideLength);
      const currentCol = nextPos % this.sideLength;
      if (localCheck(side, nextPos, color)) {
        const result = operation(nextPos, origPos, column, row, currentCol, currentRow);
        if (result === true) {
          return true;
        }
      }
      nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
    }
    return false;
  };

  solveBlueCenter = () => {
    const localRef = [
      this.opRotations[3], // done
      this.stRotations[3], // done
      this.opRotations[3], // done
      this.opRotations[2], // done
      null,
      null,
    ];
    // l: 0,
    // r: 1,
    // u: 2,
    // d: 3,
    // f: 4,
    // b: 5,

    const ls = [
      s.f,
      s.b,
      s.u,
      s.d,
      s.r,
      s.l,
    ];

    const lm = {
      L: (slice = 0, clockwise = true) => this.moves.F(slice, clockwise),
      R: (slice = 0, clockwise = true) => this.moves.B(slice, clockwise),
      U: (slice = 0, clockwise = true) => this.moves.U(slice, clockwise),
      D: (slice = 0, clockwise = true) => this.moves.D(slice, clockwise),
      F: (slice = 0, clockwise = true) => this.moves.R(slice, clockwise),
      B: (slice = 0, clockwise = true) => this.moves.L(slice, clockwise),
    };

    const localColor = (side, direction) => this.matrix[side][localRef[side][direction]];
    const localCheck = (side, direction, color) => localColor(side, direction) === color;
    const localFind = (row, col, side, operation) => {
      this.baseFind(row, col, side, ls[s.f], operation, localCheck);
    };

    const middle = Math.floor(this.sideLength / 2);

    const solveDownBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving down');
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.d, origPos, s.b)) {
          this.moves.B(row);
          this.moves.B(row);
          break;
        }
        this.moves.D();
      }
      return true;
    };

    const solveFrontBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
    };

    const solveUpBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving up');
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.d, origPos, s.b)) {
          this.moves.B(row);
          this.moves.B(row);
          break;
        }
        this.moves.D();
      }
      return true;
    };

    const solveBackBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
    };

    const solveBack = (row, column) => null;
    const solveUp = (row, column) => null;
    const solveFront = (row, column) => null;
    const solveDown = (row, column) => null;

    const solveOrder = [
      solveFront,
      solveUp,
      solveDown,
      solveBack,
    ];


    const solveCube = (row, column) => {
      if (!localCheck(s.u, this.getFaceDirection(row, column), s.b)) {
        for (let i = 0; i < solveOrder.length; i += 1) {
          // console.log(solveOrder[i])
          if (solveOrder[i](row, column)) {
            break;
          }
        }
      }
    };

    const lineLength = this.sideLength - 1;

    // special case for middle column
    for (let col = 1; col < lineLength; col += 1) {
      for (let row = 1; row < lineLength; row += 1) {
        if (!localCheck(s.u, this.getFaceDirection(row, col), s.b)) {
          console.log('solving');
          solveCube(row, col);
          if (!localCheck(s.u, this.getFaceDirection(row, col), s.b)) {
            console.log('INCORRECT');
            return false;
          }
        }
      }
    }

    // for (let col = 1; col < lineLength; col += 1) {
    //   this.moves.L(col, false);
    // }
  }

  solveYellowCenter = () => {
    const localRef = [
      this.stRotations[1], // done
      this.opRotations[1], // done
      this.opRotations[0], // done
      this.stRotations[0], // done
      null,
      this.opRotations[0], // done
    ];

    // l: 0,
    // r: 1,
    // u: 2,
    // d: 3,
    // f: 4,
    // b: 5,

    const localColor = (side, direction) => this.matrix[side][localRef[side][direction]];
    const localCheck = (side, direction, color) => localColor(side, direction) === color;
    const localFind = (row: number, col: number, side: number, operation: Function) => 
      this.baseFind(row, col, side, s.b, operation, localCheck);

    const middle = Math.floor(this.sideLength / 2);

    const solveLeftBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving left');
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.r, origPos, s.b)) {
          this.moves.B(row);
          break;
        }
        this.moves.R();
      }
      return true;
    };

    const solveRightBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving right');
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.l, origPos, s.b)) {
          this.moves.B(row, false);
          break;
        }
        this.moves.L();
      }
      return true;
    };

    const solveDownBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving down');
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.d, origPos, s.b)) {
          this.moves.B(row);
          this.moves.B(row);
          break;
        }
        this.moves.D();
      }
      return true;
    };

    const solveFrontBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving front');
      if (currentCol >= column && currentCol !== middle) {
        // move front piece to the right
        this.moves.D(currentRow); // correct
        // rotate opposite to the right once
        if ((currentCol < middle && currentRow > middle) || (currentCol > middle && currentRow < middle)) {
          this.moves.R(0, false);
        } else {
          this.moves.R();
        }
        // rotate back to down
        this.moves.B(currentCol); // correct
        // undo
        if ((currentCol < middle && currentRow > middle) || (currentCol > middle && currentRow < middle)) {
          this.moves.R();
        } else {
          this.moves.R(0, false);
        }
        this.moves.D(currentRow, false); // correct
        this.moves.B(currentCol, false);
        return true;
      }
    };

    const solveUpBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving up');
      const futurePos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);
      if (currentCol !== column) {
        this.moves.U();
        this.moves.B(futureRow);
        this.moves.U(0, false);
        return true;
      }
    };

    const solveLeft = (row, column) => localFind(row, column, s.r, solveLeftBuild);
    const solveRight = (row, column) => localFind(row, column, s.l, solveRightBuild);
    const solveUp = (row, column) => {
      if (localFind(row, column, s.u, solveUpBuild)) {
        return solveRight(row, column);
      }
    };
    const solveFront = (row, column) => {
      if (localFind(row, column, s.b, solveFrontBuild)) {
        // return solveRight(row, column);
        return solveUp(row, column);
      }
    };
    const solveDown = (row, column) => {
      if (localFind(row, column, s.d, solveDownBuild)) {
        return solveRight(row, column);
      }
    };

    const solveOrder = [
      // solveFront,
      solveUp,
      solveLeft,
      solveRight,
      solveDown,
    ];


    const solveCube = (row, column) => {
      if (!localCheck(s.u, this.getFaceDirection(row, column), s.b)) {
        for (let i = 0; i < solveOrder.length; i += 1) {
          // console.log(solveOrder[i])
          if (solveOrder[i](row, column)) {
            break;
          }
        }
      }
    };

    const lineLength = this.sideLength - 1;
    const completeFirstMiddleHalf = () => {
      console.log('found middle');
      this.moves.U();
      for (let i = 1; i < middle; i += 1) {
        this.moves.R(i);
      }
      this.moves.U(0, false);
      this.moves.U(0, false);
      for (let i = 1; i < middle; i += 1) {
        this.moves.R(i);
      }
      this.moves.U(0, false);
      this.moves.U(0, false);
      for (let i = 1; i < middle; i += 1) {
        this.moves.R(i, false);
      }
    };

    const completeSecondMiddleHalf = () => {
      console.log('found second middle');
      this.moves.U();
      for (let i = middle + 1; i < middle * 2; i += 1) {
        this.moves.R(i);
      }
      this.moves.U(0, false);
      this.moves.U(0, false);
      for (let i = middle + 1; i < middle * 2; i += 1) {
        this.moves.R(i);
      }
      this.moves.U(0, false);
      this.moves.U(0, false);
      for (let i = middle + 1; i < middle * 2; i += 1) {
        this.moves.R(i, false);
      }
    };


    for (let row = 1; row < lineLength; row += 1) {
      if (!localCheck(s.u, this.getFaceDirection(row, middle), s.b)) {
        console.log('solving');
        if (row === middle) {
          completeFirstMiddleHalf();
        } else {
          solveCube(row, middle);
          if (!localCheck(s.u, this.getFaceDirection(row, middle), s.b)) {
            console.log('INCORRECT');
            return false;
          }
        }
      }
    }
    completeSecondMiddleHalf();
    this.moves.B();

    // special case for middle column
    for (let col = 1; col < lineLength; col += 1) {
      for (let row = 1; row < lineLength; row += 1) {
        solveFront(row, col);
      }
      for (let row = 1; row < lineLength; row += 1) {
        if (col === middle) {
          // no nothing
        } else if (!localCheck(s.u, this.getFaceDirection(row, col), s.b)) {
          console.log('solving');
          solveCube(row, col);
          if (!localCheck(s.u, this.getFaceDirection(row, col), s.b)) {
            console.log('INCORRECT');
            return false;
          }
        }
      }
      if (col === middle) {
        // do nothing
      } else {
        this.moves.R(col);
        this.moves.U();
        this.moves.U();
        this.moves.R(col);
        this.moves.U();
        this.moves.U();
        this.moves.R(col, false);
      }
    }

    // for (let col = 1; col < lineLength; col += 1) {
    //   this.moves.L(col, false);
    // }
  }

  solveWhiteCenter = () => {
    const localRef = [
      this.stRotations[0],
      this.opRotations[0],
      this.opRotations[2],
      this.stRotations[2],
      this.stRotations[0],
      this.opRotations[0],
    ];

    const localColor = (side, direction) => this.matrix[side][localRef[side][direction]];
    const localCheck = (side, direction, color) => localColor(side, direction) === color;
    const localFind = (row, col, side, operation) => {
      this.baseFind(row, col, side, s.f, operation, localCheck);
    };

    const baseFunc = (row, column, side, operation) => {
      let nextPos = this.getFaceDirection(row, column);
      const origPos = nextPos;
      for (let i = 0; i < 4; i += 1) {
        const currentRow = Math.floor(nextPos / this.sideLength);
        const currentCol = nextPos % this.sideLength;
        if (localCheck(side, nextPos, s.f)) {
          const result = operation(nextPos, origPos, column, row, currentCol, currentRow);
          if (result === true) {
            return true;
          }
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }
      return false;
    };

    const solveLeftBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.l, origPos, s.f)) {
          this.moves.D(row);
          break;
        }
        this.moves.L();
      }
      return true;
    };

    const solveRightBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.r, origPos, s.f)) {
          this.moves.D(row, false);
          break;
        }
        this.moves.R();
      }
      return true;
    };

    const solveBackBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (localCheck(s.b, origPos, s.f)) {
          this.moves.D(row);
          this.moves.D(row);
          break;
        }
        this.moves.B();
      }
      return true;
    };

    const solveDownBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      const rotatedFront = Math.abs(currentCol - (this.sideLength - 1));
      if (rotatedFront >= column) {
        this.moves.D();
        this.moves.F(rotatedFront, false);
        this.moves.D(0, false);
        return true;
      }
    };

    const solveFrontBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      const futurePos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);
      const futureCol = futurePos % this.sideLength;
      if (currentCol !== column) {
        this.moves.F();
        this.moves.D(futureRow);
        this.moves.F(0, false);
        return true;
      }
    };

    const solveUpBuild = (row, column, side) => {
      let nextPos = this.getFaceDirection(row, column);
      let currentRow = null;
      let currentCol = null;
      let highestPos = nextPos;
      let found = false;
      for (let i = 0; i < 4; i += 1) {
        // highest column is a row
        currentRow = Math.floor(nextPos / this.sideLength);
        currentCol = nextPos % this.sideLength;
        highestPos = nextPos > highestPos ? nextPos : highestPos;
        if (localCheck(side, nextPos, s.f)) {
          // place it on a row where column is at
          found = true;
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }

      if (found) {
        for (let i = 0; i < 4; i += 1) {
          if (localCheck(side, highestPos, s.f)) {
            currentRow = Math.floor(highestPos / this.sideLength);
            this.moves.D();
            this.moves.F(currentRow);
            this.moves.D(0, false);
            // console.log('UP white is in ', nextPos, i);
            return true;
          }
          this.moves.U();
        }
      }
      return false;
    };

    const solveLeft = (row, column) => baseFunc(row, column, s.l, solveLeftBuild);
    const solveRight = (row, column) => baseFunc(row, column, s.r, solveRightBuild);
    const solveBack = (row, column) => baseFunc(row, column, s.b, solveBackBuild);
    const solveFront = (row, column) => {
      if (baseFunc(row, column, s.f, solveFrontBuild)) {
        return solveRight(row, column);
      }
    };
    const solveUp = (row, column) => {
      if (solveUpBuild(row, column, s.u)) {
        return solveRight(row, column);
      }
    };
    const solveDown = (row, column) => {
      if (baseFunc(row, column, s.d, solveDownBuild)) {
        return solveRight(row, column);
      }
    };

    const solveOrder = [
      solveFront,
      solveLeft,
      solveRight,
      solveBack,
      solveUp,
      solveDown,
    ];


    const solveCube = (row, column) => {
      if (!localCheck(s.f, this.getFaceDirection(row, column), s.f)) {
        for (let i = 0; i < solveOrder.length; i += 1) {
          if (solveOrder[i](row, column)) {
            break;
          }
        }
      }
    };

    // for left st 0
    // for right op 0
    // for up op 2
    // for down st 2
    // for front st 0
    // for back op 0

    const lineLength = this.sideLength - 1;

    for (let col = 1; col < lineLength; col += 1) {
      for (let row = 1; row < lineLength; row += 1) {
        if (!localCheck(s.f, this.getFaceDirection(row, col), s.f)) {
          solveCube(row, col);
          if (!localCheck(s.f, this.getFaceDirection(row, col), s.f)) {
            console.log('INCORRECT');
            return false;
          }
        }
      }
      this.moves.L(col);
    }

    for (let col = 1; col < lineLength; col += 1) {
      this.moves.L(col, false);
    }
  }


  getFaceDirection = (row, col) => col + row * this.sideLength;

  getLineCubeColor = (line, num) => this.sideLength * (num + 1) + 1 + line;

  solve = () => {
    this.solveWhiteCross();
    this.solveWhiteFace(this.sideCases, this.faceCornerCases);

    // don't use them for 2x2 cube maybe
    this.solveMiddleLayer();
    this.solveYellowCross();

    this.solveSwapYellowEdges();
    this.solvePositionYellowCorners();
    this.solveOrientLastLayerCorners();
  }

  solveOrientLastLayerCorners = () => {
    // check only from one side
    // move not correctly oriented cubes to the check side
    // do the algorithm 2 or 4 times, until faces yellow
    const firstSide = this.sideOrient[0];

    const applyAlgo = (num) => {
      for (let i = 0; i < num; i += 1) {
        this.solveOrientLastLayerCornersCase(firstSide);
      }
    };
    // find incorrect piece
    // rotate it toward first side
    const fc = this.faceCornerCases[0];
    const findAndRotate = () => {
      for (let i = 0; i < 4; i += 1) {
        if (!this.check(s.b, fc[i], s.b)) {
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
          return true;
        }
      }
      return false;
    };

    // make it so yellow is on top
    // by applying algorithm 2 or 4 times
    for (let i = 0; i < 4; i += 1) {
      if (findAndRotate()) {
        applyAlgo(2);
        if (!this.check(s.b, fc[0], s.b)) {
          applyAlgo(2);
        }
      } else {
        break;
      }
    }


    for (let i = 0; i < 4; i += 1) {
      if (!this.check(s.l, this.f.u, s.l)) {
        this.moves.B();
      } else {
        break;
      }
    }
  }

  solveOrientLastLayerCornersCase = (orientation: MoveActions) => {
    // R' D' R D
    orientation.R(0, false);
    orientation.D(0, false);
    orientation.R();
    orientation.D();
  }

  solvePositionYellowCornersCase = (orientation: MoveActions) => {
    // U R U' L' U R' U' L
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.L(0, false);
    orientation.U();
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.L();
    console.log('Yellow corner case');
  }

  solvePositionYellowCorners = () => {
    // find cube on correct position
    let totalCorrect = 0;
    let correctPos = null;

    const findCorrectCube = () => {
      correctPos = null;
      totalCorrect = 0;
      for (let i = 0; i < 4; i += 1) {
        const sc = this.sideCases[i];
        const fc = this.faceCornerCases[i];

        let desiredSum = 0;
        desiredSum += this.colorHashes[sc[0]];
        desiredSum += this.colorHashes[sc[1]];
        desiredSum += this.colorHashes[s.b];

        let sum = 0;
        sum += this.getColorHash(sc[0], this.f.ur);
        sum += this.getColorHash(sc[1], this.f.ul);
        sum += this.getColorHash(s.b, fc[0]);
        if (sum === desiredSum) {
          correctPos = i;
          totalCorrect += 1;
        }
      }
    };

    findCorrectCube();
    if (totalCorrect === 4) {
      console.log('yellow corners were initially in correct position');
      return;
    }


    // choose random orientation, instead just chose 0
    for (let i = 0; i < 10; i += 1) {
      if (correctPos === null) {
        const orientation = this.sideOrient[0];
        this.solvePositionYellowCornersCase(orientation);
        // assume that cube will be correct
        findCorrectCube();
        if (totalCorrect === 4) {
          console.log('yellow corners solved');
          return;
        }
      } else {
        break;
      }
    }

    for (let i = 0; i < 10; i += 1) {
      findCorrectCube();
      if (totalCorrect !== 4) {
        this.solvePositionYellowCornersCase(this.sideOrient[(correctPos + 1) % 4]);
      } else {
        console.log('solved it');
        break;
      }
    }
  }

  solveSwapYellowEdges = () => {
    const sc = this.sideCases[0];
    const checkComplete = () => {
      let count = 0;
      for (let i = 0; i < 4; i += 1) {
        if (this.check(sc[i], this.f.u, sc[i])) {
          count += 1;
        }
      }
      if (count === 4) {
        return true;
      }
      return false;
    };

    // rotate until at least one color matches
    // lazy check
    for (let i = 0; i < 4; i += 1) {
      if (this.check(sc[0], this.f.u, sc[0])) {
        console.log('found correct side for yellow case');
        break;
      }
      this.moves.B();
    }

    if (checkComplete()) {
      console.log('All yellow edges are correct');
      return;
    }

    // check if there are opposite cubes
    if (this.check(sc[1], this.f.u, sc[3]) && (this.check(sc[3], this.f.u, sc[1]))) {
      let orientation = this.sideOrient[sc[0]];
      orientation.U();
      this.solveSwapYellowEdgesCase(orientation);
      orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('opposite cubes');
      return;
    }


    // next cube is of the same color as first side
    if (this.check(sc[2], this.f.u, sc[3])) {
      const orientation = this.sideOrient[sc[3]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved second cube');
    }

    if (this.check(sc[1], this.f.u, sc[2])) {
      const orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved third cube');
    }

    if (this.check(sc[3], this.f.u, sc[2]) && (this.check(sc[2], this.f.u, sc[1]))) {
      let orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      orientation = this.sideOrient[sc[3]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved unique position cube');
    }
  }

  solveSwapYellowEdgesCase = (orientation: MoveActions) => {
    // R U R' U R U2 R' U
    orientation.R();
    orientation.U();
    orientation.R(0, false);
    orientation.U();
    orientation.R();
    orientation.U();
    orientation.U();
    orientation.R(0, false);
    orientation.U();
  }

  solveYellowCrossAllCase = (orientation: MoveActions) => {
    // F R U R' U' F'
    orientation.F();
    orientation.R();
    orientation.U();
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.F(0, false);
    console.log('Yellow cross case ALL');
  }

  solveYellowCrossShortcutCase = (orientation: MoveActions) => {
    // F U R U' R' F'
    orientation.F();
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.R(0, false);
    orientation.F(0, false);
    console.log('Yellow cross case SHORTCUT');
  }

  solveYellowCross = () => {
    // detect 4 cases:
    //  dot
    //  L
    //  line
    //  complete
    let orientation = null;
    console.log(this.sideCases);

    for (let i = 0; i < 10; i += 1) {
      // complete case
      if (this.check(s.b, this.f.l, s.b)
        && this.check(s.b, this.f.u, s.b)
        && this.check(s.b, this.f.r, s.b)
        && this.check(s.b, this.f.d, s.b)) {
        console.log('yellow cross is complete');
        break;
      } else if (!this.check(s.b, this.f.l, s.b)
        && !this.check(s.b, this.f.u, s.b)
        && !this.check(s.b, this.f.r, s.b)
        && !this.check(s.b, this.f.d, s.b)) {
        // dot case
        console.log('dot case');
        orientation = this.sideOrient[this.sideCases[0][0]];
      } else if (this.check(s.b, this.f.l, s.b)
              && this.check(s.b, this.f.r, s.b)) {
      // line case
        console.log('line case');
        orientation = this.sideOrient[this.sideCases[0][1]];
      } else if (this.check(s.b, this.f.u, s.b)
              && this.check(s.b, this.f.d, s.b)) {
      // line case
        console.log('line case');
        orientation = this.sideOrient[this.sideCases[0][0]];
      } else {
        // L case
        for (let j = 0; j < 4; j += 1) {
          if (this.check(s.b, this.faceCases[0][(j + 3) % 4], s.b) && this.check(s.b, this.faceCases[0][(j + 2) % 4], s.b)) {
            console.log(j);
            orientation = this.sideOrient[this.sideCases[0][j]];
            console.log('L case');
            break;
          }
        }
      }
      if (orientation === null) {
        orientation = this.sideOrient[this.sideCases[0][i % 4]];
      }

      this.solveYellowCrossAllCase(orientation);
    }
  }


  solveMiddleLayerLeftCase = (orientation: MoveActions) => {
    // U' L' U L U F U' F'
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

  solveMiddleLayerRightCase = (orientation: MoveActions) => {
    // U R U' R' U' F' U F
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
        break;
      }

      if (this.check(sc[i], this.f.u, sc[0]) && this.check(s.b, fc[i], sc[1])) {
        // 3 is incorrect
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
          this.moves.B();
        } else if (i === 3) {
          this.moves.B();
          this.moves.B();
        }
        this.solveMiddleLayerLeftCase(this.sideOrient[sc[1]]);
        break;
      }
    }
  }

  solveMiddleLayer = () => {
    for (let i = 0; i < 4; i += 1) {
      this.solveMiddleLayerSide(this.faceCases[i], this.sideCases[i]);
    }
  }

  solveWhiteCross = () => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCrossSide(this.faceCases[i], this.sideCases[i]);
    }
  }

  
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

export {
  RubikModel, 
  Move,
  MoveActions
}
