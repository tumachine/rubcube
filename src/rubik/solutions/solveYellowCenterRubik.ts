/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';


class SolveYellowCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = rubik.moves;

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[1]];
    this.interface[s.r] = [...this.rubik.opRotations[1]];
    this.interface[s.u] = [...this.rubik.opRotations[0]];
    this.interface[s.d] = [...this.rubik.stRotations[0]];
    this.interface[s.f] = null;
    this.interface[s.b] = [...this.rubik.opRotations[0]];
  }

    baseFind = (row: number, column: number, side: number, color: number, operation: Function, check: Function): boolean => {
      let nextPos = this.getFaceDirection(row, column);
      const origPos = nextPos;
      for (let i = 0; i < 4; i += 1) {
        const currentRow = Math.floor(nextPos / this.sideLength);
        const currentCol = nextPos % this.sideLength;
        if (check(side, nextPos, color)) {
          const result = operation(nextPos, origPos, column, row, currentCol, currentRow);
          if (result === true) {
            return true;
          }
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }
      return false;
    }

    localFind = (row: number, col: number, side: number, operation: Function) => this.baseFind(row, col, side, s.b, operation, this.check);

    middle = Math.floor(this.sideLength / 2);

    solveLeftBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving left');
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.r, origPos, s.b)) {
          this.m.B(row);
          break;
        }
        this.m.R();
      }
      return true;
    }

    solveRightBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving right');
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.l, origPos, s.b)) {
          this.m.B(row, false);
          break;
        }
        this.m.L();
      }
      return true;
    }

    solveDownBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving down');
      for (let j = 0; j < 4; j += 1) {
        if (this.check(s.d, origPos, s.b)) {
          this.m.B(row);
          this.m.B(row);
          break;
        }
        this.m.D();
      }
      return true;
    }

    solveFrontBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving front');
      if (currentCol >= column && currentCol !== this.middle) {
        // move front piece to the right
        this.m.D(currentRow); // correct
        // rotate opposite to the right once
        if ((currentCol < this.middle && currentRow > this.middle) || (currentCol > this.middle && currentRow < this.middle)) {
          this.m.R(0, false);
        } else {
          this.m.R();
        }
        // rotate back to down
        this.m.B(currentCol); // correct
        // undo
        if ((currentCol < this.middle && currentRow > this.middle) || (currentCol > this.middle && currentRow < this.middle)) {
          this.m.R();
        } else {
          this.m.R(0, false);
        }
        this.m.D(currentRow, false); // correct
        this.m.B(currentCol, false);
        return true;
      }
    }

    solveUpBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('solving up');
      const futurePos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);
      if (currentCol !== column) {
        this.m.U();
        this.m.B(futureRow);
        this.m.U(0, false);
        return true;
      }
    }

    solveLeft = (row, column) => this.localFind(row, column, s.r, this.solveLeftBuild);

    solveRight = (row, column) => this.localFind(row, column, s.l, this.solveRightBuild);

    solveUp = (row, column) => {
      if (this.localFind(row, column, s.u, this.solveUpBuild)) {
        return this.solveRight(row, column);
      }
    }

    solveFront = (row, column) => {
      if (this.localFind(row, column, s.b, this.solveFrontBuild)) {
        // return solveRight(row, column);
        return this.solveUp(row, column);
      }
    }

    solveDown = (row, column) => {
      if (this.localFind(row, column, s.d, this.solveDownBuild)) {
        return this.solveRight(row, column);
      }
    }

    solveOrder = [
      // solveFront,
      this.solveUp,
      this.solveLeft,
      this.solveRight,
      this.solveDown,
    ]


    solveCube = (row, column) => {
      if (!this.check(s.u, this.getFaceDirection(row, column), s.b)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
        //   console.log(this.solveOrder[i]);
          if (this.solveOrder[i](row, column)) {
            break;
          }
        }
      }
    }

    lineLength = this.sideLength - 1;

    completeFirstMiddleHalf = () => {
      console.log('found middle');
      this.m.U();
      for (let i = 1; i < this.middle; i += 1) {
        this.m.R(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = 1; i < this.middle; i += 1) {
        this.m.R(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = 1; i < this.middle; i += 1) {
        this.m.R(i, false);
      }
    }

    completeSecondMiddleHalf = () => {
      console.log('found second middle');
      this.m.U();
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.R(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.R(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.R(i, false);
      }
    }


    solve = () => {
      for (let row = 1; row < this.lineLength; row += 1) {
        if (!this.check(s.u, this.getFaceDirection(row, this.middle), s.b)) {
          console.log('solving');
          if (row === this.middle) {
            this.completeFirstMiddleHalf();
          } else {
            this.solveCube(row, this.middle);
            if (!this.check(s.u, this.getFaceDirection(row, this.middle), s.b)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
      }
      this.completeSecondMiddleHalf();
      this.m.B();

      // special case for middle column
      for (let col = 1; col < this.lineLength; col += 1) {
        for (let row = 1; row < this.lineLength; row += 1) {
          this.solveFront(row, col);
        }
        for (let row = 1; row < this.lineLength; row += 1) {
          if (col === this.middle) {
            // no nothing
          } else if (!this.check(s.u, this.getFaceDirection(row, col), s.b)) {
            console.log('solving');
            this.solveCube(row, col);
            if (!this.check(s.u, this.getFaceDirection(row, col), s.b)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
        if (col === this.middle) {
          // do nothing
        } else {
          this.m.R(col);
          this.m.U();
          this.m.U();
          this.m.R(col);
          this.m.U();
          this.m.U();
          this.m.R(col, false);
        }
      }
    }

  // for (let col = 1; col < lineLength; col += 1) {
  //   this.m.L(col, false);
  // }
}

export default SolveYellowCenterRubik;
