/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';
import { OperationAfterFound, FindReturn } from './d';

class SolveBlueCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  // local sides
  private ls;

  private moveHistory: Function[];

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = new MoveActions();
    this.m.L = rubik.moves.F;
    this.m.R = rubik.moves.B;
    this.m.F = rubik.moves.R;
    this.m.B = rubik.moves.L;
    this.m.U = rubik.moves.U;
    this.m.D = rubik.moves.D;

    this.ls = {
      l: s.f,
      r: s.b,
      f: s.r,
      b: s.l,
      u: s.u,
      d: s.d,
    };

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[2]];
    this.interface[s.r] = [...this.rubik.opRotations[0]];
    this.interface[s.u] = [...this.rubik.opRotations[3]];
    this.interface[s.d] = [...this.rubik.stRotations[1]];
    this.interface[s.f] = null;
    this.interface[s.b] = null;

    this.primaryColor = this.ls.f;
    this.moveHistory = [];
  }

    localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

    middle = Math.floor(this.sideLength / 2);
    // which lines not to touch, which moves were on settled columns

    // place everything on top
    // similar for back and bottom
    // special cases for front and top
    solveBackBuild = (r: FindReturn): boolean => {
      // console.log('BLUE CENTER: solving back');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.B(0, false);
      }
      const activeCol = Math.abs(r.row - (this.sideLength - 1));

      this.m.L(r.column);

      if (r.column < activeCol) {
        this.m.U(0, false);
        this.m.L(r.column, false);
        this.m.U();
      }
      return true;
    }

    solveDownBuild = (r: FindReturn): boolean => {
      // console.log('BLUE CENTER: solving down');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.D(0, false);
      }

      const activeCol = Math.abs(r.row - (this.sideLength - 1));
      this.m.L(r.column);
      this.m.L(r.column);
      // if movement would mess up already established columns
      // record backward movements
      if (r.column < activeCol) {
        this.m.U(0, false);
        this.m.L(r.column, false);
        this.m.L(r.column, false);
        this.m.U();
      }
      return true;
    }

    solveFrontBuild = (r: FindReturn): boolean => {
      // console.log('BLUE CENTER: solving front');
      const activeCol = Math.abs(r.row - (this.sideLength - 1));
      if (r.currentCol < activeCol) {
        // console.log('ACTIVE ROW');
        return false;
      }

      this.m.L(r.currentCol, false);
      this.m.L(r.currentCol, false);

      if (r.currentCol < r.column) {
        // console.log('HAVE TO RECORD');
        this.moveHistory.push(() => this.m.L(r.currentCol));
        this.moveHistory.push(() => this.m.L(r.currentCol));
      }

      return true;
    }

    solveUpBuild = (r: FindReturn): boolean => {
      // console.log('BLUE CENTER: solving up');
      const activeCol = Math.abs(r.row - (this.sideLength - 1));

      if (r.row === r.currentRow) {
        // console.log('SAME ROW');
        return false;
      }

      let futurePos;
      let futureCol = r.nextPos % this.sideLength;
      let futureRow = Math.floor(r.nextPos / this.sideLength);

      for (let i = 0; i < 3; i += 1) {
        futurePos = futureRow + (this.sideLength - 1 - futureCol) * this.sideLength;
        futureCol = futurePos % this.sideLength;
        futureRow = Math.floor(futurePos / this.sideLength);
      }
      // console.log(r.nextPos);
      // console.log(futurePos);
      // console.log(futureCol);

      this.m.U(0, false);
      this.m.L(futureCol, false);

      if (futureCol < activeCol) {
        // console.log(`FUTURE POS: ${futurePos}`);

        if (futureCol === this.middle) {
          this.m.B();
        } else {
          this.m.B();
          this.m.B();
        }

        this.m.L(futureCol);
        this.m.U();
      } else {
        this.m.U();
      }
      return true;
    }

    solveBack = (row, column) => this.localFind(row, column, this.ls.b, this.solveBackBuild);

    solveDown = (row, column) => this.localFind(row, column, this.ls.d, this.solveDownBuild);

    solveFront = (row, column) => {
      if (this.localFind(row, column, this.ls.f, this.solveFrontBuild)) {
        this.solveBack(row, column);
        for (let i = this.moveHistory.length - 1; i >= 0; i -= 1) {
          this.moveHistory[i]();
        }
        this.moveHistory = [];
        return true;
      }
      return false;
    }

    solveUp = (row, column) => {
      if (this.localFind(row, column, this.ls.u, this.solveUpBuild)) {
        this.solveBack(row, column);
        return true;
      }
      return false;
    }

    solveOrder = [
      this.solveFront,
      this.solveUp,
      this.solveDown,
      this.solveBack,
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

    solve = () => {
      const lineLength = this.sideLength - 1;

      for (let row = lineLength - 1; row >= 1; row -= 1) {
        for (let col = 1; col < lineLength; col += 1) {
          // console.log(row, col);
          this.solveCube(row, col);
          // for (let c = 1; c < col; c += 1) {
          //   if (!this.check(this.ls.u, this.getFaceDirection(row, c), this.ls.f)) {
          //     // console.log('INCORRECT AA');
          //     return false;
          //   }
          // }
        }
        const activeCol = Math.abs(row - (this.sideLength - 1));
        // console.log(`Active Col: ${activeCol}`);
        this.m.U(0, false);
        this.m.L(activeCol, true);
        // console.log('COMPLETE');
      }

      for (let c = 1; c < lineLength; c += 1) {
        for (let r = 1; r < lineLength; r += 1) {
          if (!this.check(this.ls.f, this.getFaceDirection(r, c), this.ls.f)) {
            console.log('INCORRECT solution');
            return false;
          }
        }
      }
    }
}

export default SolveBlueCenterRubik;
