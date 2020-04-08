/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';


class SolveWhiteCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = rubik.moves;

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[0]];
    this.interface[s.r] = [...this.rubik.opRotations[0]];
    this.interface[s.u] = [...this.rubik.opRotations[2]];
    this.interface[s.d] = [...this.rubik.stRotations[2]];
    this.interface[s.f] = [...this.rubik.stRotations[0]];
    this.interface[s.b] = [...this.rubik.opRotations[0]];
  }


    baseFunc = (row, column, side, operation) => {
      let nextPos = this.getFaceDirection(row, column);
      const origPos = nextPos;
      for (let i = 0; i < 4; i += 1) {
        const currentRow = Math.floor(nextPos / this.sideLength);
        const currentCol = nextPos % this.sideLength;
        if (this.check(side, nextPos, s.f)) {
          const result = operation(nextPos, origPos, column, row, currentCol, currentRow);
          if (result === true) {
            return true;
          }
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }
      return false;
    }

    solveLeftBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.l, origPos, s.f)) {
          this.m.D(row);
          break;
        }
        this.m.L();
      }
      return true;
    }

    solveRightBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.r, origPos, s.f)) {
          this.m.D(row, false);
          break;
        }
        this.m.R();
      }
      return true;
    }

    solveBackBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.b, origPos, s.f)) {
          this.m.D(row);
          this.m.D(row);
          break;
        }
        this.m.B();
      }
      return true;
    }

    solveDownBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      const rotatedFront = Math.abs(currentCol - (this.sideLength - 1));
      if (rotatedFront >= column) {
        this.m.D();
        this.m.F(rotatedFront, false);
        this.m.D(0, false);
        return true;
      }
    }

    solveFrontBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      const futurePos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);
      const futureCol = futurePos % this.sideLength;
      if (currentCol !== column) {
        this.m.F();
        this.m.D(futureRow);
        this.m.F(0, false);
        return true;
      }
    }

    solveUpBuild = (row, column, side) => {
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
        if (this.check(side, nextPos, s.f)) {
          // place it on a row where column is at
          found = true;
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }

      if (found) {
        for (let i = 0; i < 4; i += 1) {
          if (this.check(side, highestPos, s.f)) {
            currentRow = Math.floor(highestPos / this.sideLength);
            this.m.D();
            this.m.F(currentRow);
            this.m.D(0, false);
            // console.log('UP white is in ', nextPos, i);
            return true;
          }
          this.m.U();
        }
      }
      return false;
    }

    solveLeft = (row, column) => this.baseFunc(row, column, s.l, this.solveLeftBuild);

    solveRight = (row, column) => this.baseFunc(row, column, s.r, this.solveRightBuild);

    solveBack = (row, column) => this.baseFunc(row, column, s.b, this.solveBackBuild);

    solveFront = (row, column) => {
      if (this.baseFunc(row, column, s.f, this.solveFrontBuild)) {
        return this.solveRight(row, column);
      }
    }

    solveUp = (row, column) => {
      if (this.solveUpBuild(row, column, s.u)) {
        return this.solveRight(row, column);
      }
    }

    solveDown = (row, column) => {
      if (this.baseFunc(row, column, s.d, this.solveDownBuild)) {
        return this.solveRight(row, column);
      }
    }

    solveOrder = [
      this.solveFront,
      this.solveLeft,
      this.solveRight,
      this.solveBack,
      this.solveUp,
      this.solveDown,
    ]


    solveCube = (row, column) => {
      if (!this.check(s.f, this.getFaceDirection(row, column), s.f)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
          if (this.solveOrder[i](row, column)) {
            break;
          }
        }
      }
    }

    // for left st 0
    // for right op 0
    // for up op 2
    // for down st 2
    // for front st 0
    // for back op 0
    solve = () => {
      const lineLength = this.sideLength - 1;

      for (let col = 1; col < lineLength; col += 1) {
        for (let row = 1; row < lineLength; row += 1) {
          if (!this.check(s.f, this.getFaceDirection(row, col), s.f)) {
            this.solveCube(row, col);
            if (!this.check(s.f, this.getFaceDirection(row, col), s.f)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
        this.m.L(col);
      }

      for (let col = 1; col < lineLength; col += 1) {
        this.m.L(col, false);
      }
    }
}


export default SolveWhiteCenterRubik;
