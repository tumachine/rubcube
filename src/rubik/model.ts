/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import { sides as s } from './utils';
import Face from './face';
import Move from './move';
import MoveActions from './moveActions';

type Matrix = Array<Array<number>>;
type Slices = Array<Array<Array<number>>>;

class RubikModel {
  private posHor: Array<Array<Array<number>>>

  private posVer: Array<Array<Array<number>>>

  private posDep: Array<Array<Array<number>>>

  private posDepRev: Array<Array<Array<number>>>

  private posClockwise: Array<number>

  private posCounter: Array<number>

  public sideLength: number

  public totalColors: number

  public matrix: Array<Array<number>>

  public matrixReference: Array<Array<number>>

  public f: Face

  private sequenceHor: Array<number> = [s.f, s.l, s.b, s.r, s.f];

  private sequenceVer: Array<number> = [s.u, s.b, s.d, s.f, s.u];

  private sequenceDep: Array<number> = [s.l, s.u, s.r, s.d, s.l];

  private sequenceHorRev: Array<number> = [s.r, s.b, s.l, s.f, s.r];

  private sequenceVerRev: Array<number> = [s.f, s.d, s.b, s.u, s.f];

  private sequenceDepRev: Array<number> = [s.d, s.r, s.u, s.l, s.d];

  public moveHistory: Array<Move>

  public moves: MoveActions

  public stRotations: Array<Array<number>>

  public opRotations: Array<Array<number>>


  public constructor(sideLength: number) {
    this.sideLength = sideLength;
    this.totalColors = sideLength * sideLength;
    this.matrix = this.createMatrix();


    this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);

    this.generatePositions();

    this.createRotations();

    this.f = new Face(sideLength);


    this.moveHistory = [];

    this.moves = new MoveActions();
    this.moves.L = (slice = 0, clockwise = true) => this.regMove(new Move('L', 0 + slice, !clockwise, 'x', this.rotateVer, this.getCubesVer));
    this.moves.R = (slice = 0, clockwise = true) => this.regMove(new Move('R', this.sideLength - 1 - slice, clockwise, 'x', this.rotateVer, this.getCubesVer));
    this.moves.U = (slice = 0, clockwise = true) => this.regMove(new Move('U', this.sideLength - 1 - slice, clockwise, 'y', this.rotateHor, this.getCubesHor));
    this.moves.D = (slice = 0, clockwise = true) => this.regMove(new Move('D', 0 + slice, !clockwise, 'y', this.rotateHor, this.getCubesHor));
    this.moves.F = (slice = 0, clockwise = true) => this.regMove(new Move('F', this.sideLength - 1 - slice, clockwise, 'z', this.rotateDep, this.getCubesDep));
    this.moves.B = (slice = 0, clockwise = true) => this.regMove(new Move('B', 0 + slice, !clockwise, 'z', this.rotateDep, this.getCubesDep));
  }


  public generateRandomMoves = (num: number, randomSlices = false) => {
    function randomInt(min: number, max: number) {
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
    console.log('Generated random moves');
    // console.log(this.moveHistory);
  }

  regMove = (m: Move) => {
    this.moveHistory.push(m);
    m.rotate(true);
  }

  private rotateVer = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, realMatrix);
    this.rotateFaceReal(slice, s.l, s.r, clockwise ? this.posCounter : this.posClockwise, realMatrix);
  }

  private rotateHor = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, realMatrix);
    this.rotateFaceReal(slice, s.d, s.u, clockwise ? this.posCounter : this.posClockwise, realMatrix);
  }

  private rotateDep = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    this.rotate(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice, realMatrix);
    this.rotateFaceReal(slice, s.b, s.f, clockwise ? this.posClockwise : this.posCounter, realMatrix);
  }

  private createRotations = () => {
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
  }

  private getCubesHor = (slice: number): number[] => this.getCubes(this.posHor, this.sequenceHor, slice, s.d, s.u);

  private getCubesVer = (slice: number): number[] => this.getCubes(this.posVer, this.sequenceVer, slice, s.l, s.r);

  private getCubesDep = (slice: number): number[] => this.getCubes(this.posDep, this.sequenceDep, slice, s.b, s.f);

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
    const matrixRubic: number[][] = [
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

  private rotate = (slices: Slices, sequence: Array<number>, slice: number, realMatrix: boolean) => {
    const matrix = realMatrix ? this.matrix : this.matrixReference;
    const layer = slices[slice];
    let first = layer[0];
    // save values of first face
    const firstFace = layer[0].map((i) => matrix[sequence[0]][i]);

    // probably most efficient way
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
    const slices: number[][][] = [];
    // slice
    for (let i = 0; i < this.sideLength; i += 1) {
      const slice: number[][] = [];
      // 4 faces
      for (let face = 0; face < 4; face += 1) {
        const faces: number[] = [];
        slice.push(faces);
      }
      slices.push(slice);
    }
    return slices;
  }

  private rotateFaceReal = (slice: number, bottom: number, top: number, clockwiseArr: Array<number>, realMatrix: boolean) => {
    const matrix = realMatrix ? this.matrix : this.matrixReference;
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
}

export default RubikModel;
