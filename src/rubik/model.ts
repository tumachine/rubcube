/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line max-classes-per-file
import { sides as s, sides, getLargestValue, sidesStr, sidesMap } from './utils';
import Face from './face';
import { MoveActions, MoveInterface } from './moveActions';
import { Move, MoveOperation } from './move';

type Matrix = Array<Array<number>>;
type Slices = Array<Array<Array<number>>>;

interface MoveHistory {
  side: number,
  slice: number | number[],
  clockwise: boolean,
  rotation: boolean,
}


class RubikModel {
  public sideLength: number

  public totalColors: number

  private sequenceHor: number[] = [s.f, s.l, s.b, s.r, s.f]

  private sequenceVer: number[] = [s.u, s.b, s.d, s.f, s.u]

  private sequenceDep: number[] = [s.l, s.u, s.r, s.d, s.l]

  private sequenceHorRev: number[] = [s.r, s.b, s.l, s.f, s.r]

  private sequenceVerRev: number[] = [s.f, s.d, s.b, s.u, s.f]

  private sequenceDepRev: number[] = [s.d, s.r, s.u, s.l, s.d]

  private posCounter: number[]

  private posClockwise: number[]

  private posHor: Slices

  private posVer: Slices

  private posDep: Slices

  private posDepRev: Slices

  private f: Face

  public m: MoveActions

  // user mouse moves
  public mu: MoveActions

  public matrix: Matrix

  private matrixReference: Matrix

  public stRotations: number[][]

  public opRotations: number[][]

  public moveHistory: MoveHistory[]

  private matrixHistory: Matrix[]

  public currentHistoryIndex: number

  private currentMoves: MoveHistory[]

  private moveSides: number[][][]

  private rotations: Move[][][]

  private moves: Move[]

  private slices: number[]

  // side orientation
  public SO: number[]

  public matrixForRotations: Matrix

  public constructor(sideLength: number) {
    this.sideLength = sideLength;
    this.totalColors = sideLength * sideLength;

    this.generatePositions();

    this.generateRotations();

    this.f = new Face(sideLength);

    this.moves = [
      new Move('L', 'x', this.rotateVer, this.getCubesVer, this.sideLength, true),
      new Move('R', 'x', this.rotateVer, this.getCubesVer, this.sideLength, false),
      new Move('U', 'y', this.rotateHor, this.getCubesHor, this.sideLength, false),
      new Move('D', 'y', this.rotateHor, this.getCubesHor, this.sideLength, true),
      new Move('F', 'z', this.rotateDep, this.getCubesDep, this.sideLength, false),
      new Move('B', 'z', this.rotateDep, this.getCubesDep, this.sideLength, true),
    ];

    this.reset();
    this.resetSO();

    // option to push to matrix history or not
    this.m = new MoveActions(this.moveOperation);
    this.mu = new MoveActions(this.userMoveOperation);

    this.generateSideRotations();
    this.generateOrientationSides();


    this.slices = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      this.slices.push(i);
    }
  }

  public resetSO = () => {
    this.SO = [
      sides.l,
      sides.r,
      sides.u,
      sides.d,
      sides.f,
      sides.b,
    ];
  }

  public rotateOVer = (clockwise: boolean) => {
    this.rotateCube(s.l, this.rotateSOVer, clockwise);
  }

  public rotateOHor = (clockwise: boolean) => {
    this.rotateCube(s.d, this.rotateSOHor, clockwise);
  }

  public rotateODep = (clockwise: boolean) => {
    this.rotateCube(s.b, this.rotateSODep, clockwise);
  }

  private rotateCube = (side: number, sidesRotation: Function, clockwise: boolean) => {
    this.currentMoves.push({ side, slice: this.slices, clockwise, rotation: true });
    sidesRotation(clockwise);
  }

  private getOrientation = (sideF: number, sideU: number) => this.rotations[sideF][sideU];

  private getSideOrientation = (sideF: number, sideU: number) => this.moveSides[sideF][sideU];

  public getUserMove = (moveH: MoveHistory) => {
    return new MoveOperation(this.moves[moveH.side], moveH.slice, moveH.clockwise);
  }

  public getInternalMove = (moveH: MoveHistory) => {
    let iWhite: number;
    let iOrange: number;
    for (let i = 0; i < 6; i += 1) {
      if (this.SO[i] === sides.f) {
        iWhite = i;
      } else if (this.SO[i] === sides.u) {
        iOrange = i;
      }
    }
    const orientation = this.getOrientation(iWhite, iOrange);
    return new MoveOperation(orientation[moveH.side], moveH.slice, moveH.clockwise);
  }

  private createMoveBasedOnOrientation = (side: number, slice: number | number[], clockwise: boolean): MoveHistory => {
    const sideF = this.SO[s.f];
    const sideU = this.SO[s.u];

    const realSide = this.getSideOrientation(sideF, sideU)[side];

    return {
      side: realSide, slice, clockwise, rotation: false,
    };
  }

  private moveOperation = (side: number, slice: number | number[], clockwise: boolean) => {
    const moveH = this.createMoveBasedOnOrientation(side, slice, clockwise);

    // rotate real matrix, with correct orientation
    this.getUserMove(moveH).rotate(true);

    this.matrixHistory.push(this.deepCopyMatrix(this.matrix));

    this.moveHistory.push(moveH);
    this.currentMoves.push(moveH);
    this.currentHistoryIndex += 1;
  };

  private userMoveOperation = (side: number, slice: number, clockwise: boolean) => {
    const moveH = this.createMoveBasedOnOrientation(side, slice, clockwise);

    // this.getInternalMove({ side, slice, clockwise, rotation: false }).rotate(true);

    // rotate real matrix based on a limited user input
    this.getUserMove({ side: moveH.side, slice, clockwise, rotation: false }).rotate(true);
    // rotate ref matrix 
    this.getUserMove({ side, slice, clockwise, rotation: false }).rotate(false);
    moveH.rotation = true;

    this.matrixHistory.push(this.deepCopyMatrix(this.matrix));

    this.moveHistory.push(moveH);
    this.currentHistoryIndex += 1;
  };

  public reset = () => {
    this.matrix = this.createMatrix();
    this.matrixReference = this.createMatrixReference();
    this.currentHistoryIndex = 0;

    this.moveHistory = [null];
    this.matrixHistory = [this.deepCopyMatrix(this.matrix)];
    this.currentMoves = [];
  }

  private rotateSOVer = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[sides.u] = copySO[sides.b];
      this.SO[sides.f] = copySO[sides.u];
      this.SO[sides.d] = copySO[sides.f];
      this.SO[sides.b] = copySO[sides.d];
    } else {
      this.SO[sides.u] = copySO[sides.f];
      this.SO[sides.f] = copySO[sides.d];
      this.SO[sides.d] = copySO[sides.b];
      this.SO[sides.b] = copySO[sides.u];
    }
  }

  private rotateSOHor = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[sides.f] = copySO[sides.l];
      this.SO[sides.r] = copySO[sides.f];
      this.SO[sides.b] = copySO[sides.r];
      this.SO[sides.l] = copySO[sides.b];
    } else {
      this.SO[sides.f] = copySO[sides.r];
      this.SO[sides.r] = copySO[sides.b];
      this.SO[sides.b] = copySO[sides.l];
      this.SO[sides.l] = copySO[sides.f];
    }
  }

  private rotateSODep = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[sides.u] = copySO[sides.r];
      this.SO[sides.r] = copySO[sides.d];
      this.SO[sides.d] = copySO[sides.l];
      this.SO[sides.l] = copySO[sides.u];
    } else {
      this.SO[sides.u] = copySO[sides.l];
      this.SO[sides.r] = copySO[sides.u];
      this.SO[sides.d] = copySO[sides.r];
      this.SO[sides.l] = copySO[sides.d];
    }
  }

  public update = (matrix: Matrix) => {
    this.matrix = this.deepCopyMatrix(matrix);
    this.matrixReference = this.createMatrixReference();
  }

  public moveBackward = () => {
    if (this.currentHistoryIndex > 0) {
      const currentMove = this.moveHistory[this.currentHistoryIndex];

      const iMove = this.getUserMove(currentMove);
      iMove.clockwise = !iMove.clockwise;

      iMove.rotate(true);

      this.currentHistoryIndex -= 1;

      this.currentMoves.push({ side: currentMove.side, slice: currentMove.slice, clockwise: !currentMove.clockwise, rotation: false });
    }
  }

  public moveForward = () => {
    if (this.currentHistoryIndex + 1 < this.moveHistory.length) {
      this.currentHistoryIndex += 1;
      const currentMove = this.moveHistory[this.currentHistoryIndex];

      const iMove = this.getUserMove(currentMove);
      iMove.rotate(true);

      this.currentMoves.push(currentMove);
    }
  }

  public removeHistoryByCurrentIndex = () => {
    if (this.currentHistoryIndex < this.moveHistory.length) {
      this.matrixHistory = this.matrixHistory.slice(0, this.currentHistoryIndex + 1);
      this.moveHistory = this.moveHistory.slice(0, this.currentHistoryIndex + 1);
    }
  }

  public addMove = (side: number, slice: number | number[], clockwise: boolean) => {
    this.removeHistoryByCurrentIndex();
    this.moveOperation(side, slice, clockwise);
  }

  public getNextMove = (): MoveHistory => this.currentMoves.shift();

  public jumpToHistoryIndex = (historyIndex: number) => {
    this.update(this.matrixHistory[historyIndex]);
    this.currentHistoryIndex = historyIndex;
  }

  private deepCopyMatrix = (matrix: Matrix) => {
    const newMatrix: Matrix = [];
    for (let i = 0; i < matrix.length; i += 1) {
      newMatrix.push([]);
      for (let j = 0; j < matrix[i].length; j += 1) {
        newMatrix[i].push(matrix[i][j]);
      }
    }
    return newMatrix;
  }

  public getColor = (side: number, direction: number, matrix: Matrix = this.matrix): number => matrix[side][direction];

  public getColorFromInterface = (side: number, direction: number, inter: number[][]): number => this.matrix[side][inter[side][direction]];

  public getCube = (side: number, direction: number): number => this.matrixReference[side][direction];

  public getCubeFromInterface = (side: number, direction: number, inter: number[][]): number => this.matrixReference[side][inter[side][direction]];

  public scramble = (moves: number) => {
    if (this.sideLength > 3) {
      this.doRandomMoves(moves, true);
    } else {
      this.doRandomMoves(moves);
    }
  }

  private generateSideRotations = () => {
    const verticalSides: number[][] = [];
    const verticalOppSides: number[][] = [];
    const horizontalSides: number[][] = [];
    const horizontalOppSides: number[][] = [];
    const depthSides: number[][] = [];
    const depthOppSides: number[][] = [];

    for (let i = 0; i < 4; i += 1) {
      // private sequenceVer: number[] = [s.u, s.b, s.d, s.f, s.u]
      verticalSides.push([
        sides.l,
        sides.r,
        this.sequenceVer[(0 + i) % 4],
        this.sequenceVer[(2 + i) % 4],
        this.sequenceVer[(3 + i) % 4],
        this.sequenceVer[(1 + i) % 4],
      ]);

      // private sequenceVerRev: number[] = [s.f, s.d, s.b, s.u, s.f]
      verticalOppSides.push([
        sides.r,
        sides.l,
        this.sequenceVerRev[(1 + i) % 4],
        this.sequenceVerRev[(3 + i) % 4],
        this.sequenceVerRev[(0 + i) % 4],
        this.sequenceVerRev[(2 + i) % 4],
      ]);

      // private sequenceHor: number[] = [s.f, s.l, s.b, s.r, s.f]
      horizontalSides.push([
        sides.d,
        sides.u,
        this.sequenceHor[(1 + i) % 4],
        this.sequenceHor[(3 + i) % 4],
        this.sequenceHor[(0 + i) % 4],
        this.sequenceHor[(2 + i) % 4],
      ]);

      // private sequenceHorRev: number[] = [s.r, s.b, s.l, s.f, s.r]
      horizontalOppSides.push([
        sides.u,
        sides.d,
        this.sequenceHorRev[(0 + i) % 4],
        this.sequenceHorRev[(2 + i) % 4],
        this.sequenceHorRev[(3 + i) % 4],
        this.sequenceHorRev[(1 + i) % 4],
      ]);

      // private sequenceDep: number[] = [s.l, s.u, s.r, s.d, s.l]
      depthSides.push([
        sides.b,
        sides.f,
        this.sequenceDep[(2 + i) % 4],
        this.sequenceDep[(0 + i) % 4],
        this.sequenceDep[(1 + i) % 4],
        this.sequenceDep[(3 + i) % 4],
      ]);

      // private sequenceDepRev: number[] = [s.d, s.r, s.u, s.l, s.d]
      depthOppSides.push([
        sides.f,
        sides.b,
        this.sequenceDepRev[(3 + i) % 4],
        this.sequenceDepRev[(1 + i) % 4],
        this.sequenceDepRev[(2 + i) % 4],
        this.sequenceDepRev[(0 + i) % 4],
      ]);
    }

    this.moveSides = new Array(6);

    for (let i = 0; i < this.moveSides.length; i += 1) {
      this.moveSides[i] = new Array<number[]>(6);
    }

    this.moveSides[s.f][s.u] = verticalSides[0];
    this.moveSides[s.u][s.b] = verticalSides[1];
    this.moveSides[s.b][s.d] = verticalSides[2];
    this.moveSides[s.d][s.f] = verticalSides[3];

    this.moveSides[s.f][s.r] = horizontalOppSides[0];
    this.moveSides[s.r][s.b] = horizontalOppSides[1];
    this.moveSides[s.b][s.l] = horizontalOppSides[2];
    this.moveSides[s.l][s.f] = horizontalOppSides[3];

    this.moveSides[s.f][s.d] = verticalOppSides[0];
    this.moveSides[s.d][s.b] = verticalOppSides[1];
    this.moveSides[s.b][s.u] = verticalOppSides[2];
    this.moveSides[s.u][s.f] = verticalOppSides[3];

    this.moveSides[s.f][s.l] = horizontalSides[0];
    this.moveSides[s.l][s.b] = horizontalSides[1];
    this.moveSides[s.b][s.r] = horizontalSides[2];
    this.moveSides[s.r][s.f] = horizontalSides[3];

    this.moveSides[s.u][s.r] = depthSides[0];
    this.moveSides[s.r][s.d] = depthSides[1];
    this.moveSides[s.d][s.l] = depthSides[2];
    this.moveSides[s.l][s.u] = depthSides[3];

    this.moveSides[s.u][s.l] = depthOppSides[0];
    this.moveSides[s.l][s.d] = depthOppSides[1];
    this.moveSides[s.d][s.r] = depthOppSides[2];
    this.moveSides[s.r][s.u] = depthOppSides[3];

    const ms = new Array(6);

    for (let i = 0; i < ms.length; i += 1) {
      ms[i] = new Array<number[]>(6);
    }
  }

  private generateOrientationSides = () => {
    // check front and top color
    // 24 possible rotations
    this.rotations = [];
    for (let i = 0; i < 6; i += 1) {
      this.rotations.push(new Array<Move[]>(6));
    }

    const createOrientationMove = (sidesS: number[]): Move[] => {
      const moveRotations = [];
      for (let i = 0; i < sidesS.length; i += 1) {
        moveRotations.push(this.moves[sidesS[i]]);
      }
      return moveRotations;
    };

    for (let i = 0; i < 6; i += 1) {
      for (let j = 0; j < 6; j += 1) {
        if (this.moveSides[i][j] !== undefined) {
          this.rotations[i][j] = createOrientationMove(this.moveSides[i][j]);
        }
      }
    }
  }

  private doRandomMoves = (num: number, randomSlices = false) => {
    function randomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const moves: MoveInterface[] = [
      this.m.D,
      this.m.U,
      this.m.F,
      this.m.B,
      this.m.L,
      this.m.R,
    ];

    if (randomSlices === true) {
      for (let i = 0; i < num; i += 1) {
        const clockwise = randomInt(0, 1) === 0;
        // random moves should not move center slices
        const slice = randomInt(0, Math.floor(this.sideLength / 2) - 1);
        moves[randomInt(0, moves.length - 1)](slice, clockwise);
      }
    } else {
      for (let i = 0; i < num; i += 1) {
        const clockwise = randomInt(0, 1) === 0;
        moves[randomInt(0, moves.length - 1)](0, clockwise);
      }
    }
    console.log('Generated random moves');
    // console.log(this.moveHistory);
  }

  private createMatrix = (): Matrix => {
    const totalColors: number = this.sideLength * this.sideLength;
    const matrixRubic = [];
    for (let i = 0; i < 6; i += 1) {
      const tempArr = [];
      for (let q = 0; q < totalColors; q += 1) {
        tempArr.push(i);
      }
      matrixRubic.push(tempArr);
    }

    return matrixRubic;
  }

  private createMatrixReference = (): Matrix => {
    const cubes = this.sideLength * this.sideLength * this.sideLength;
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

  private rotateVerMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.l, top: number = s.r) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, bottom, top, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateHorMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.d, top: number = s.u) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, matrix);
    this.rotateFaceReal(slice, bottom, top, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateDepMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.b, top: number = s.f) => {
    this.rotate(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice, matrix);
    this.rotateFaceReal(slice, bottom, top, clockwise ? this.posClockwise : this.posCounter, matrix);
  }

  private rotateVer = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    const matrix = realMatrix ? this.matrix : this.matrixReference;
    this.rotateVerMatrix(slice, clockwise, matrix);
  }

  private rotateHor = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    const matrix = realMatrix ? this.matrix : this.matrixReference;
    this.rotateHorMatrix(slice, clockwise, matrix);
  }

  private rotateDep = (slice: number, clockwise: boolean, realMatrix: boolean = true) => {
    const matrix = realMatrix ? this.matrix : this.matrixReference;
    this.rotateDepMatrix(slice, clockwise, matrix);
  }

  public getCubesHor = (slice: number): number[] => this.getCubes(this.posHor, this.sequenceHor, slice, s.d, s.u);

  public getCubesVer = (slice: number): number[] => this.getCubes(this.posVer, this.sequenceVer, slice, s.l, s.r);

  public getCubesDep = (slice: number): number[] => this.getCubes(this.posDep, this.sequenceDep, slice, s.b, s.f);

  private getCubes = (slices: Slices, sequence: Array<number>, slice: number, bottom: number, top: number): number[] => {
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

  private generateRotations = () => {
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

  private rotate = (slices: Slices, sequence: Array<number>, slice: number, matrix: Matrix) => {
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
}

export default RubikModel;
