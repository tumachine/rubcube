/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';
import { OperationAfterFound, FindReturn } from './d';


class SolveYellowCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  private ls;

  public constructor(rubik: RubikModel) {
    super(rubik);

    // this.m = rubik.moves;
    this.m = new MoveActions();
    this.m.L = rubik.moves.R;
    this.m.R = rubik.moves.L;
    this.m.F = rubik.moves.B;
    this.m.B = rubik.moves.F;
    this.m.U = rubik.moves.U;
    this.m.D = rubik.moves.D;

    this.ls = {
      l: s.r,
      r: s.l,
      f: s.b,
      b: s.f,
      u: s.u,
      d: s.d,
    };

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[1]];
    this.interface[s.r] = [...this.rubik.opRotations[1]];
    this.interface[s.u] = [...this.rubik.opRotations[0]];
    this.interface[s.d] = [...this.rubik.stRotations[0]];
    this.interface[s.f] = null;
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    this.primaryColor = this.ls.f;
  }

    localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

    middle = Math.floor(this.sideLength / 2);

    solveLeftBuild = (r: FindReturn): boolean => {
      // console.log('solving left');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.L(0, false);
      }
      this.m.F(r.row);
      return true;
    }

    solveRightBuild = (r: FindReturn): boolean => {
      // console.log('solving right');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.R(0, false);
      }
      this.m.F(r.row, false);
      return true;
    }

    solveDownBuild = (r: FindReturn): boolean => {
      // console.log('solving down');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.D(0, false);
      }
      this.m.F(r.row);
      this.m.F(r.row);
      return true;
    }

    solveFrontBuild = (r: FindReturn): boolean => {
      // console.log('solving front');
      if (r.currentCol >= r.column && r.currentCol !== this.middle) {
        // move front piece to the right
        this.m.D(r.currentRow); // correct
        // rotate opposite to the right once
        if ((r.currentCol < this.middle && r.currentRow > this.middle) || (r.currentCol > this.middle && r.currentRow < this.middle)) {
          this.m.L(0, false);
        } else {
          this.m.L();
        }
        // rotate back to down
        this.m.F(r.currentCol); // correct
        // undo
        if ((r.currentCol < this.middle && r.currentRow > this.middle) || (r.currentCol > this.middle && r.currentRow < this.middle)) {
          this.m.L();
        } else {
          this.m.L(0, false);
        }
        this.m.D(r.currentRow, false); // correct
        this.m.F(r.currentCol, false);
        return true;
      }
      return false;
    }

    solveUpBuild = (r: FindReturn): boolean => {
      // console.log('solving up');
      const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);
      if (r.currentCol !== r.column) {
        this.m.U();
        this.m.F(futureRow);
        this.m.U(0, false);
        return true;
      }
      return false;
    }

    solveLeft = (row, column) => this.localFind(row, column, this.ls.l, this.solveLeftBuild);

    solveRight = (row, column) => this.localFind(row, column, this.ls.r, this.solveRightBuild);

    solveUp = (row, column) => {
      if (this.localFind(row, column, this.ls.u, this.solveUpBuild)) {
        return this.solveRight(row, column);
      }
    }

    solveFront = (row, column) => {
      if (this.localFind(row, column, this.ls.f, this.solveFrontBuild)) {
        return this.solveUp(row, column);
      }
    }

    solveDown = (row, column) => {
      if (this.localFind(row, column, this.ls.d, this.solveDownBuild)) {
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
      if (!this.check(this.ls.u, this.getFaceDirection(row, column), this.ls.f)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
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
        this.m.L(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = 1; i < this.middle; i += 1) {
        this.m.L(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = 1; i < this.middle; i += 1) {
        this.m.L(i, false);
      }
    }

    completeSecondMiddleHalf = () => {
      console.log('found second middle');
      this.m.U();
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.L(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.L(i);
      }
      this.m.U(0, false);
      this.m.U(0, false);
      for (let i = this.middle + 1; i < this.middle * 2; i += 1) {
        this.m.L(i, false);
      }
    }


    solve = () => {
      for (let row = 1; row < this.lineLength; row += 1) {
        if (!this.check(this.ls.u, this.getFaceDirection(row, this.middle), this.ls.f)) {
          console.log('solving');
          if (row === this.middle) {
            this.completeFirstMiddleHalf();
          } else {
            this.solveCube(row, this.middle);
            if (!this.check(this.ls.u, this.getFaceDirection(row, this.middle), this.ls.f)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
      }
      this.completeSecondMiddleHalf();
      this.m.F();

      // special case for middle column
      for (let col = 1; col < this.lineLength; col += 1) {
        for (let row = 1; row < this.lineLength; row += 1) {
          this.solveFront(row, col);
        }
        for (let row = 1; row < this.lineLength; row += 1) {
          if (col === this.middle) {
            // no nothing
          } else if (!this.check(this.ls.u, this.getFaceDirection(row, col), this.ls.f)) {
            console.log('solving');
            this.solveCube(row, col);
            if (!this.check(this.ls.u, this.getFaceDirection(row, col), this.ls.f)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
        if (col === this.middle) {
          // do nothing
        } else {
          this.m.L(col);
          this.m.U();
          this.m.U();
          this.m.L(col);
          this.m.U();
          this.m.U();
          this.m.L(col, false);
        }
      }
    }
}

export default SolveYellowCenterRubik;
