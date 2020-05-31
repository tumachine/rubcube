/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line max-classes-per-file
import { Side as s, Matrix, randomInt } from './utils';
import Face from './face';
import { MoveActions, MoveInterface } from './moveActions';
import { Move, MoveOperation, CurrentMoveHistory, CubeDir } from './move';
import RubikSolver from './solver';

type Slices = Array<Array<Array<number>>>;

enum MoveType {
  SOLVE = 0,
  USER = 1,
  RANDOM = 2,
}

interface MoveHistory {
  side: number,
  slice: number | number[],
  clockwise: boolean,
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

  public matrix: number[][]

  public stRotations: number[][]

  public opRotations: number[][]

  public moveHistory: MoveHistory[]

  public currentHistoryIndex: number

  public currentMoves: CurrentMoveHistory[]

  private moveSides: number[][][]

  private rotations: Move[][][]

  private moves: Move[]

  private slices: number[]

  // side orientation
  private SO: number[]

  private solver: RubikSolver

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

    this.generateSideRotations();
    this.generateOrientationSides();

    this.slices = [];
    for (let i = 0; i < this.sideLength; i += 1) {
      this.slices.push(i);
    }

    this.solver = new RubikSolver(this);
  }

  // for solve - generate moves starting from currentIndex and current matrix
  // once all moves are generated push them to currentMoves
  // solve, scramble, from - to = should use separate function, and disallow any movements while it's happening
  // user moves, like rotation, slice, back and forward, should be adding to currentMoves
  public generateSolveMoves = () => {
    this.removeHistoryByCurrentIndex();
    const copyMatrix = this.deepCopyMatrix(this.matrix);

    const t0 = performance.now();
    this.solver.solve();
    const t1 = performance.now();
    console.log('Took', (t1 - t0).toFixed(4), 'milliseconds to solve');

    this.matrix = copyMatrix;
  }

  public generateRandomMoves = (moves: number) => {
    this.removeHistoryByCurrentIndex();

    const randomSlices = this.sideLength > 3;
    for (let i = 0; i < moves; i += 1) {
      const move = this.getRandomMove(randomSlices);
      this.moveHistory.push(move);
    }
  }

  public resetSO = () => {
    this.SO = [
      s.l,
      s.r,
      s.u,
      s.d,
      s.f,
      s.b,
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
    const moveH: MoveHistory = { side, slice: this.slices, clockwise };
    const getMove = () => this.getUserMove(moveH);
    const onComplete = () => sidesRotation(clockwise);

    this.currentMoves.push(new CurrentMoveHistory(moveH, -1, getMove, onComplete));
  }

  private getOrientation = (sideF: number, sideU: number) => this.rotations[sideF][sideU];

  private getSideOrientation = (sideF: number, sideU: number) => this.moveSides[sideF][sideU];

  public getUserMove = (moveH: MoveHistory) => {
    return new MoveOperation(this.moves[moveH.side], moveH.slice, moveH.clockwise);
  }

  public getInternalMove = (moveH: MoveHistory): MoveOperation => {
    let iWhite: number;
    let iOrange: number;
    for (let i = 0; i < 6; i += 1) {
      if (this.SO[i] === s.f) {
        iWhite = i;
      } else if (this.SO[i] === s.u) {
        iOrange = i;
      }
    }
    const orientation = this.getOrientation(iWhite, iOrange);
    return new MoveOperation(orientation[moveH.side], moveH.slice, moveH.clockwise);
  }

  public createMoveBasedOnOrientation = (side: number, slice: number | number[], clockwise: boolean): MoveHistory => {
    const sideF = this.SO[s.f];
    const sideU = this.SO[s.u];

    const realSide = this.getSideOrientation(sideF, sideU)[side];

    return {
      side: realSide, slice, clockwise,
    };
  }

  public clearCurrentMoves = () => {
    this.currentMoves = [];
  }

  // this function is primarily for generating moves that depend on matrix change, like solve()
  private moveOperation = (side: number, slice: number | number[], clockwise: boolean) => {
    const moveH = new MoveOperation(this.moves[side], slice, clockwise);
    moveH.rotate(this.matrix);
    this.moveHistory.push({
      side, slice, clockwise,
    });
  }

  public reset = () => {
    this.matrix = this.createMatrix();
    this.currentHistoryIndex = 0;

    this.moveHistory = [null];
    this.currentMoves = [];
  }

  private rotateSOVer = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[s.u] = copySO[s.b];
      this.SO[s.f] = copySO[s.u];
      this.SO[s.d] = copySO[s.f];
      this.SO[s.b] = copySO[s.d];
    } else {
      this.SO[s.u] = copySO[s.f];
      this.SO[s.f] = copySO[s.d];
      this.SO[s.d] = copySO[s.b];
      this.SO[s.b] = copySO[s.u];
    }
  }

  private rotateSOHor = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[s.f] = copySO[s.l];
      this.SO[s.r] = copySO[s.f];
      this.SO[s.b] = copySO[s.r];
      this.SO[s.l] = copySO[s.b];
    } else {
      this.SO[s.f] = copySO[s.r];
      this.SO[s.r] = copySO[s.b];
      this.SO[s.b] = copySO[s.l];
      this.SO[s.l] = copySO[s.f];
    }
  }

  private rotateSODep = (clockwise: boolean) => {
    const copySO = [...this.SO];
    if (clockwise) {
      this.SO[s.u] = copySO[s.r];
      this.SO[s.r] = copySO[s.d];
      this.SO[s.d] = copySO[s.l];
      this.SO[s.l] = copySO[s.u];
    } else {
      this.SO[s.u] = copySO[s.l];
      this.SO[s.r] = copySO[s.u];
      this.SO[s.d] = copySO[s.r];
      this.SO[s.l] = copySO[s.d];
    }
  }

  public moveBackward = () => {
    if (this.currentHistoryIndex > 0) {
      const currentMove = this.moveHistory[this.currentHistoryIndex];
      const moveH: MoveHistory = { side: currentMove.side, slice: currentMove.slice, clockwise: !currentMove.clockwise };
      this.currentHistoryIndex -= 1;

      const getMove = () => this.getInternalMove(moveH);
      const onComplete = () => {
        const iMove = this.getUserMove(currentMove);
        iMove.clockwise = !iMove.clockwise;
        iMove.rotate(this.matrix);
      };

      this.currentMoves.push(new CurrentMoveHistory(moveH, this.currentHistoryIndex, getMove, onComplete));
    }
  }

  public moveForward = () => {
    if (this.currentHistoryIndex + 1 < this.moveHistory.length) {
      this.currentHistoryIndex += 1;
      const currentMove = this.moveHistory[this.currentHistoryIndex];

      const getMove = () => this.getInternalMove(currentMove);
      const onComplete = () => {
        const iMove = this.getUserMove(currentMove);
        iMove.rotate(this.matrix);
      };

      this.currentMoves.push(new CurrentMoveHistory(currentMove, this.currentHistoryIndex, getMove, onComplete));
    }
  }

  public removeHistoryByCurrentIndex = () => {
    if (this.currentHistoryIndex < this.moveHistory.length) {
      this.moveHistory = this.moveHistory.slice(0, this.currentHistoryIndex + 1);
    }
  }

  public doUserMove = (side: number, slice: number | number[], clockwise: boolean, addToCurrentMoves: boolean = true) => {
    this.removeHistoryByCurrentIndex();
    const moveH = this.createMoveBasedOnOrientation(side, slice, clockwise);
    this.moveHistory.push(moveH);
    this.currentHistoryIndex += 1;

    const getMove = () => this.getInternalMove(moveH);
    const onComplete = () => {
      this.getUserMove(moveH).rotate(this.matrix);
    };

    const currentMove = new CurrentMoveHistory(moveH, this.currentHistoryIndex, getMove, onComplete);
    if (addToCurrentMoves) {
      this.currentMoves.push(currentMove);
    }
    return currentMove;
  }

  public getNextMove = (): CurrentMoveHistory => this.currentMoves.shift();

  public jumpToHistoryIndex = (historyIndex: number) => {
    const steps = historyIndex - this.currentHistoryIndex;
    if (steps > 0) {
      // move forward
      for (let i = 0; i < steps; i += 1) {
        this.currentHistoryIndex += 1;
        const currentMove = this.moveHistory[this.currentHistoryIndex];
        const iMove = this.getUserMove(currentMove);
        iMove.rotate(this.matrix);
      }
    } else if (steps < 0) {
      // move backwards
      const absSteps = Math.abs(steps);
      for (let i = 0; i < absSteps; i += 1) {
        const currentMove = this.moveHistory[this.currentHistoryIndex];
        const backwardsMove: MoveHistory = { side: currentMove.side, slice: currentMove.slice, clockwise: !currentMove.clockwise };

        const iMove = this.getUserMove(backwardsMove);
        iMove.rotate(this.matrix);

        this.currentHistoryIndex -= 1;
      }
    }
    // after jumping to history index, it's better to reset planes
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

  // public getCube = (side: number, direction: number): number => this.matrixReference[side][direction];

  // public getCubeFromInterface = (side: number, direction: number, inter: number[][]): number => this.matrixReference[side][inter[side][direction]];

  private getRandomMove = (randomSlices = false): MoveHistory => {
    const side = randomInt(0, 5);

    let slice: number;
    if (randomSlices) {
      slice = randomInt(0, Math.floor(this.sideLength / 2) - 1);
    } else {
      slice = 0;
    }
    const clockwise = randomInt(0, 1) === 0;
    return {
      side, slice, clockwise,
    };
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
        s.l,
        s.r,
        this.sequenceVer[(0 + i) % 4],
        this.sequenceVer[(2 + i) % 4],
        this.sequenceVer[(3 + i) % 4],
        this.sequenceVer[(1 + i) % 4],
      ]);

      // private sequenceVerRev: number[] = [s.f, s.d, s.b, s.u, s.f]
      verticalOppSides.push([
        s.r,
        s.l,
        this.sequenceVerRev[(1 + i) % 4],
        this.sequenceVerRev[(3 + i) % 4],
        this.sequenceVerRev[(0 + i) % 4],
        this.sequenceVerRev[(2 + i) % 4],
      ]);

      // private sequenceHor: number[] = [s.f, s.l, s.b, s.r, s.f]
      horizontalSides.push([
        s.d,
        s.u,
        this.sequenceHor[(1 + i) % 4],
        this.sequenceHor[(3 + i) % 4],
        this.sequenceHor[(0 + i) % 4],
        this.sequenceHor[(2 + i) % 4],
      ]);

      // private sequenceHorRev: number[] = [s.r, s.b, s.l, s.f, s.r]
      horizontalOppSides.push([
        s.u,
        s.d,
        this.sequenceHorRev[(0 + i) % 4],
        this.sequenceHorRev[(2 + i) % 4],
        this.sequenceHorRev[(3 + i) % 4],
        this.sequenceHorRev[(1 + i) % 4],
      ]);

      // private sequenceDep: number[] = [s.l, s.u, s.r, s.d, s.l]
      depthSides.push([
        s.b,
        s.f,
        this.sequenceDep[(2 + i) % 4],
        this.sequenceDep[(0 + i) % 4],
        this.sequenceDep[(1 + i) % 4],
        this.sequenceDep[(3 + i) % 4],
      ]);

      // private sequenceDepRev: number[] = [s.d, s.r, s.u, s.l, s.d]
      depthOppSides.push([
        s.f,
        s.b,
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

  private rotateVer = <T, > (slice: number, clockwise: boolean, matrix: T[][]) => {
    this.rotate(this.posVer, clockwise ? this.sequenceVerRev : this.sequenceVer, slice, matrix);
    this.rotateFaceReal(slice, s.l, s.r, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateHor = <T, >(slice: number, clockwise: boolean, matrix: T[][]) => {
    this.rotate(this.posHor, clockwise ? this.sequenceHorRev : this.sequenceHor, slice, matrix);
    this.rotateFaceReal(slice, s.d, s.u, clockwise ? this.posCounter : this.posClockwise, matrix);
  }

  private rotateDep = <T, >(slice: number, clockwise: boolean, matrix: T[][]) => {
    this.rotate(clockwise ? this.posDepRev : this.posDep, clockwise ? this.sequenceDepRev : this.sequenceDep, slice, matrix);
    this.rotateFaceReal(slice, s.b, s.f, clockwise ? this.posClockwise : this.posCounter, matrix);
  }

  public getColumn = (direction: number) => direction % this.sideLength;

  public getRow = (direction: number) => Math.floor(direction / this.sideLength);

  public getCubesHor = (slice: number): CubeDir[] => this.getCubes(this.posHor, this.sequenceHor, slice, s.d, s.u);

  public getCubesVer = (slice: number): CubeDir[] => this.getCubes(this.posVer, this.sequenceVer, slice, s.l, s.r);

  public getCubesDep = (slice: number): CubeDir[] => this.getCubes(this.posDep, this.sequenceDep, slice, s.b, s.f);

  private getCubes = (slices: Slices, sequence: number[], slice: number, bottom: number, top: number): CubeDir[] => {
    const cubes: CubeDir[] = [];

    if (slice === 0) {
      for (let i = 0; i < this.totalColors; i += 1) {
        cubes.push({ side: bottom, direction: i });
      }
    }

    if (slice === this.sideLength - 1) {
      for (let i = 0; i < this.totalColors; i += 1) {
        cubes.push({ side: top, direction: i });
      }
    }

    const layer = slices[slice];

    for (let face = 0; face < layer.length; face += 1) {
      for (let i = 0; i < layer[face].length; i += 1) {
        cubes.push({ side: sequence[face], direction: layer[face][i] });
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

  private rotate = <T, >(slices: Slices, sequence: number[], slice: number, matrix: T[][]) => {
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

  private rotateFaceReal = <T, >(slice: number, bottom: number, top: number, clockwiseArr: number[], matrix: T[][]) => {
    if (slice === 0) {
      this.rotateFace(bottom, clockwiseArr, matrix);
    } else if (slice === this.sideLength - 1) {
      this.rotateFace(top, clockwiseArr, matrix);
    }
  }

  // keep matrix and reference separated
  // ref update is unnesesary unless you have a rubik model
  private rotateFace = <T, >(face: number, positionFace: number[], matrix: T[][]) => {
    const faceCopy = [...matrix[face]];
    for (let i = 0; i < this.totalColors; i += 1) {
      matrix[face][i] = faceCopy[positionFace[i]];
    }
  }
}

export default RubikModel;
