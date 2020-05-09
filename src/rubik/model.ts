/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line max-classes-per-file
import { sides as s, sides, getLargestValue } from './utils';
import Face from './face';
import { MoveActions, MoveInterface } from './moveActions';
import { Move, MoveOperation } from './move';

type Matrix = Array<Array<number>>;
type Slices = Array<Array<Array<number>>>;

class MoveH {
  side: number

  slice: number | number[]

  clockwise: boolean

  graphical: boolean

  public constructor(side: number, slice: number | number[], clockwise: boolean, graphical: boolean = true) {
    this.side = side;
    this.slice = slice;
    this.clockwise = clockwise;
    this.graphical = graphical;
  }
}

interface MoveHistory {
  side: number,
  slice: number | number[],
  clockwise: boolean,
  graphical: boolean,
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

  public matrix: Matrix

  private matrixReference: Matrix

  public stRotations: number[][]

  public opRotations: number[][]

  public moveHistory: MoveHistory[]

  private matrixHistory: Matrix[]

  public currentHistoryIndex: number

  private currentMoves: MoveHistory[]

  public interface: number[][]

  public moveRotations: Move[][][]

  public rotations: Move[][][]

  // user mouse moves
  public mu: MoveActions

  // side orientation
  public SO: number[]

  public moveOrientation: Move[]

  public moves: Move[]

  private slices: number[]

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

    this.generateMoves();
    this.generateUserMoves();

    this.generateMoveRotations();
    this.generateOrientaionRotations();

    this.SO = [
      sides.l,
      sides.r,
      sides.u,
      sides.d,
      sides.f,
      sides.b,
    ];
    this.moveOrientation = this.rotations[s.f][s.u];

    this.slices = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      this.slices.push(i);
    }
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
    // const moveO = new MoveOperation(this.moves[side], this.slices, clockwise);
    // moveO.rotate(false);

    this.currentMoves.push({
      side, slice: this.slices, clockwise, graphical: true,
    });
    // const gMove = this.getGraphicalMove(side, this.slices, clockwise);
    // gMove.rotate(false);

    sidesRotation(clockwise);
    this.determineRotation();
  }

  private determineRotation = () => {
    this.moveOrientation = this.rotations[this.SO[sides.f]][this.SO[sides.u]];
  }

  public getOrientation = (sideF: number, sideU: number) => this.rotations[sideF][sideU];

  public getGraphicalMove = (side: number, slice: number | number[], clockwise: boolean) => {
    return new MoveOperation(this.moves[side], slice, clockwise);
  }

  public getInternalMove = (side: number, slice: number | number[], clockwise: boolean) => {
    return new MoveOperation(this.moveOrientation[side], slice, clockwise);
  }

  public moveOperation = (side: number, slice: number | number[], clockwise: boolean) => {
    const iMove = this.getInternalMove(side, slice, clockwise);
    iMove.rotate(true);

    this.matrixHistory.push(this.deepCopyMatrix(this.matrix));
    this.moveHistory.push({ side, slice, clockwise, graphical: true });
    this.currentMoves.push({ side, slice, clockwise, graphical: true });
    this.currentHistoryIndex += 1;
  };

  private generateMoves = () => {
    // option to push to matrix history or not
    this.m = new MoveActions();
    // this.m.L = (slice = 0, clockwise = true) => this.moveOperation(this.moves[sides.l], slice, clockwise);
    this.m.L = (slice = 0, clockwise = true) => this.moveOperation(sides.l, slice, clockwise);
    this.m.R = (slice = 0, clockwise = true) => this.moveOperation(sides.r, slice, clockwise);
    this.m.U = (slice = 0, clockwise = true) => this.moveOperation(sides.u, slice, clockwise);
    this.m.D = (slice = 0, clockwise = true) => this.moveOperation(sides.d, slice, clockwise);
    this.m.F = (slice = 0, clockwise = true) => this.moveOperation(sides.f, slice, clockwise);
    this.m.B = (slice = 0, clockwise = true) => this.moveOperation(sides.b, slice, clockwise);
  }

  private generateUserMoves = () => {
    const userMoveOperation = (side: number, slice: number, clockwise: boolean) => {
      this.getInternalMove(side, slice, clockwise).rotate(true);
      this.getGraphicalMove(side, slice, clockwise).rotate(false);

      this.matrixHistory.push(this.deepCopyMatrix(this.matrix));
      this.moveHistory.push({ side, slice, clockwise, graphical: true });
      this.currentHistoryIndex += 1;
    };

    this.mu = new MoveActions();
    this.mu.L = (slice = 0, clockwise = true) => userMoveOperation(sides.l, slice, clockwise);
    this.mu.R = (slice = 0, clockwise = true) => userMoveOperation(sides.r, slice, clockwise);
    this.mu.U = (slice = 0, clockwise = true) => userMoveOperation(sides.u, slice, clockwise);
    this.mu.D = (slice = 0, clockwise = true) => userMoveOperation(sides.d, slice, clockwise);
    this.mu.F = (slice = 0, clockwise = true) => userMoveOperation(sides.f, slice, clockwise);
    this.mu.B = (slice = 0, clockwise = true) => userMoveOperation(sides.b, slice, clockwise);
  }

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
    if (!clockwise) {
      this.SO[sides.u] = copySO[sides.f];
      this.SO[sides.f] = copySO[sides.d];
      this.SO[sides.d] = copySO[sides.b];
      this.SO[sides.b] = copySO[sides.u];
    } else {
      this.SO[sides.u] = copySO[sides.b];
      this.SO[sides.f] = copySO[sides.u];
      this.SO[sides.d] = copySO[sides.f];
      this.SO[sides.b] = copySO[sides.d];
    }
  }

  private rotateSOHor = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (!clockwise) {
      this.SO[sides.f] = copySO[sides.r];
      this.SO[sides.r] = copySO[sides.b];
      this.SO[sides.b] = copySO[sides.l];
      this.SO[sides.l] = copySO[sides.f];
    } else {
      this.SO[sides.f] = copySO[sides.l];
      this.SO[sides.r] = copySO[sides.f];
      this.SO[sides.b] = copySO[sides.r];
      this.SO[sides.l] = copySO[sides.b];
    }
  }

  private rotateSODep = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (!clockwise) {
      this.SO[sides.u] = copySO[sides.l];
      this.SO[sides.r] = copySO[sides.u];
      this.SO[sides.d] = copySO[sides.r];
      this.SO[sides.l] = copySO[sides.d];
    } else {
      this.SO[sides.u] = copySO[sides.r];
      this.SO[sides.r] = copySO[sides.d];
      this.SO[sides.d] = copySO[sides.l];
      this.SO[sides.l] = copySO[sides.u];
    }
  }

  public update = (matrix: Matrix) => {
    this.matrix = this.deepCopyMatrix(matrix);
    this.matrixReference = this.createMatrixReference();
  }

  public moveBackward = () => {
    console.log(this.currentHistoryIndex);
    if (this.currentHistoryIndex > 0) {
      const currentMove = this.moveHistory[this.currentHistoryIndex];
      const iMove = this.getInternalMove(currentMove.side, currentMove.slice, currentMove.clockwise).getOpposite();
      // const gMove = this.getGraphicalMove(currentMove.side, currentMove.slice, currentMove.clockwise).getOpposite();

      iMove.rotate(true);
      // gMove.rotate(false);

      const side = currentMove.side;
      const slice = currentMove.slice;
      const clockwise = !currentMove.clockwise;

      const mHistory: MoveHistory = { side, slice, clockwise, graphical: false };

      this.currentHistoryIndex -= 1;
      this.currentMoves.push(mHistory);
    }
  }

  public moveForward = () => {
    if (this.currentHistoryIndex + 1 < this.moveHistory.length) {
      this.currentHistoryIndex += 1;
      const currentMove = this.moveHistory[this.currentHistoryIndex];

      const iMove = this.getInternalMove(currentMove.side, currentMove.slice, currentMove.clockwise);
      // const gMove = this.getGraphicalMove(currentMove.side, currentMove.slice, currentMove.clockwise).getOpposite();

      iMove.rotate(true);

      currentMove.graphical = false;
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

  public deepCopyMatrix = (matrix: Matrix) => {
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

  private generateMoveRotations = () => {
    const defMoves: Move[] = [
      this.moves[sides.l],
      this.moves[sides.r],
      this.moves[sides.u],
      this.moves[sides.d],
      this.moves[sides.f],
      this.moves[sides.b],
    ];

    this.moveRotations = new Array(6);

    const verticalMoves: Move[][] = [];
    const verticalOppMoves: Move[][] = [];
    const horizontalMoves: Move[][] = [];
    const horizontalOppMoves: Move[][] = [];
    const depthMoves: Move[][] = [];
    const depthOppMoves: Move[][] = [];


    for (let i = 0; i < 4; i += 1) {
      // private sequenceVer: number[] = [s.u, s.b, s.d, s.f, s.u]
      verticalMoves.push([
        this.moves[sides.l],
        this.moves[sides.r],
        defMoves[this.sequenceVer[(0 + i) % 4]],
        defMoves[this.sequenceVer[(2 + i) % 4]],
        defMoves[this.sequenceVer[(3 + i) % 4]],
        defMoves[this.sequenceVer[(1 + i) % 4]],
      ]);

      // private sequenceVerRev: number[] = [s.f, s.d, s.b, s.u, s.f]
      verticalOppMoves.push([
        this.moves[sides.r],
        this.moves[sides.l],
        defMoves[this.sequenceVerRev[(1 + i) % 4]],
        defMoves[this.sequenceVerRev[(3 + i) % 4]],
        defMoves[this.sequenceVerRev[(0 + i) % 4]],
        defMoves[this.sequenceVerRev[(2 + i) % 4]],
      ]);

      // private sequenceHor: number[] = [s.f, s.l, s.b, s.r, s.f]
      horizontalMoves.push([
        this.moves[sides.d],
        this.moves[sides.u],
        defMoves[this.sequenceHor[(1 + i) % 4]],
        defMoves[this.sequenceHor[(3 + i) % 4]],
        defMoves[this.sequenceHor[(0 + i) % 4]],
        defMoves[this.sequenceHor[(2 + i) % 4]],
      ]);

      // private sequenceHorRev: number[] = [s.r, s.b, s.l, s.f, s.r]
      horizontalOppMoves.push([
        this.moves[sides.u],
        this.moves[sides.d],
        defMoves[this.sequenceHorRev[(0 + i) % 4]],
        defMoves[this.sequenceHorRev[(2 + i) % 4]],
        defMoves[this.sequenceHorRev[(3 + i) % 4]],
        defMoves[this.sequenceHorRev[(1 + i) % 4]],
      ]);

      // private sequenceDep: number[] = [s.l, s.u, s.r, s.d, s.l]
      depthMoves.push([
        this.moves[sides.b],
        this.moves[sides.f],
        defMoves[this.sequenceDep[(2 + i) % 4]],
        defMoves[this.sequenceDep[(0 + i) % 4]],
        defMoves[this.sequenceDep[(1 + i) % 4]],
        defMoves[this.sequenceDep[(3 + i) % 4]],
      ]);

      // private sequenceDepRev: number[] = [s.d, s.r, s.u, s.l, s.d]
      depthOppMoves.push([
        this.moves[sides.f],
        this.moves[sides.b],
        defMoves[this.sequenceDepRev[(3 + i) % 4]],
        defMoves[this.sequenceDepRev[(1 + i) % 4]],
        defMoves[this.sequenceDepRev[(2 + i) % 4]],
        defMoves[this.sequenceDepRev[(0 + i) % 4]],
      ]);
    }

    this.moveRotations[s.f] = [];
    this.moveRotations[s.f].push(verticalMoves[0]);
    this.moveRotations[s.f].push(horizontalOppMoves[0]);
    this.moveRotations[s.f].push(verticalOppMoves[0]);
    this.moveRotations[s.f].push(horizontalMoves[0]);

    this.moveRotations[s.u] = [];
    this.moveRotations[s.u].push(verticalMoves[1]);
    this.moveRotations[s.u].push(depthMoves[0]);
    this.moveRotations[s.u].push(verticalOppMoves[3]);
    this.moveRotations[s.u].push(depthOppMoves[0]);

    this.moveRotations[s.b] = [];
    this.moveRotations[s.b].push(verticalOppMoves[2]);
    this.moveRotations[s.b].push(horizontalOppMoves[2]);
    this.moveRotations[s.b].push(verticalMoves[2]);
    this.moveRotations[s.b].push(horizontalMoves[2]);

    this.moveRotations[s.d] = [];
    this.moveRotations[s.d].push(verticalMoves[3]);
    this.moveRotations[s.d].push(depthOppMoves[2]);
    this.moveRotations[s.d].push(verticalOppMoves[1]);
    this.moveRotations[s.d].push(depthMoves[2]);

    this.moveRotations[s.l] = [];
    this.moveRotations[s.l].push(depthMoves[3]);
    this.moveRotations[s.l].push(horizontalOppMoves[3]);
    this.moveRotations[s.l].push(depthOppMoves[1]);
    this.moveRotations[s.l].push(horizontalMoves[1]);

    this.moveRotations[s.r] = [];
    this.moveRotations[s.r].push(depthOppMoves[3]);
    this.moveRotations[s.r].push(horizontalOppMoves[1]);
    this.moveRotations[s.r].push(depthMoves[1]);
    this.moveRotations[s.r].push(horizontalMoves[3]);
  }

  private generateOrientaionRotations = () => {
    // check front and top color
    // 24 possible rotations
    this.rotations = [];
    for (let i = 0; i < 6; i += 1) {
      this.rotations.push(new Array<Move[]>(6));
    }

    // down clockwise
    this.rotations[sides.l][sides.u] = this.moveRotations[sides.l][0];
    this.rotations[sides.l][sides.f] = this.moveRotations[sides.l][1];
    this.rotations[sides.l][sides.d] = this.moveRotations[sides.l][2];
    this.rotations[sides.l][sides.b] = this.moveRotations[sides.l][3];

    this.rotations[sides.r][sides.u] = this.moveRotations[sides.r][0];
    this.rotations[sides.r][sides.b] = this.moveRotations[sides.r][1];
    this.rotations[sides.r][sides.d] = this.moveRotations[sides.r][2];
    this.rotations[sides.r][sides.f] = this.moveRotations[sides.r][3];

    this.rotations[sides.u][sides.b] = this.moveRotations[sides.u][0];
    this.rotations[sides.u][sides.r] = this.moveRotations[sides.u][1];
    this.rotations[sides.u][sides.f] = this.moveRotations[sides.u][2];
    this.rotations[sides.u][sides.l] = this.moveRotations[sides.u][3];

    // good
    this.rotations[sides.d][sides.f] = this.moveRotations[sides.d][0];
    this.rotations[sides.d][sides.r] = this.moveRotations[sides.d][1];
    this.rotations[sides.d][sides.b] = this.moveRotations[sides.d][2];
    this.rotations[sides.d][sides.l] = this.moveRotations[sides.d][3];

    this.rotations[sides.f][sides.u] = this.moveRotations[sides.f][0];
    this.rotations[sides.f][sides.r] = this.moveRotations[sides.f][1];
    this.rotations[sides.f][sides.d] = this.moveRotations[sides.f][2];
    this.rotations[sides.f][sides.l] = this.moveRotations[sides.f][3];

    this.rotations[sides.b][sides.u] = this.moveRotations[sides.b][0];
    this.rotations[sides.b][sides.l] = this.moveRotations[sides.b][1];
    this.rotations[sides.b][sides.d] = this.moveRotations[sides.b][2];
    this.rotations[sides.b][sides.r] = this.moveRotations[sides.b][3];
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

  //   private register = (m: Move) => {
  //     this.history.push(m);
  //     // should separate rotations
  //     // m.rotate(true);
  //   }
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

  public rotateVerMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.l, top: number = s.r) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, bottom, top, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  public rotateHorMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.d, top: number = s.u) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, matrix);
    this.rotateFaceReal(slice, bottom, top, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  public rotateDepMatrix = (slice: number, clockwise: boolean, matrix: Matrix, bottom: number = s.b, top: number = s.f) => {
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
