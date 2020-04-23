/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import RubikModel from '../model';
import { sides as s } from '../utils';
import { FindReturn } from './d';


class SolveYellowMiddleLineRubik extends RubikSolutionBase {
  public constructor(rubik: RubikModel) {
    super(rubik);

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

    this.interface[s.l] = [...this.rubik.stRotations[1]];
    this.interface[s.r] = [...this.rubik.opRotations[1]];
    this.interface[s.u] = [...this.rubik.opRotations[0]];
    this.interface[s.d] = [...this.rubik.stRotations[0]];
    this.interface[s.f] = null;
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    this.primaryColor = this.ls.f;
  }

    solveLeftBuild = (r: FindReturn): boolean => {
      // console.log('YELLOW MIDDLE: solving left');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.L(0, false);
      }
      this.m.F(0, false);
      this.m.D(r.column);
      this.m.F();
      this.m.D(r.column, false);
      return true;
    }

    solveRightBuild = (r: FindReturn): boolean => {
      // console.log('YELLOW MIDDLE: solving right');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.R(0, false);
      }
      this.m.F();
      this.m.U(r.column);
      this.m.F(0, false);
      this.m.U(r.column, false);
      return true;
    }

    solveDownBuild = (r: FindReturn): boolean => {
      // console.log('YELLOW MIDDLE: solving down');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.D(0, false);
      }
      this.m.F();
      this.m.F();
      this.m.R(r.column);
      this.m.F();
      this.m.R(r.column, false);
      this.m.F();
      return true;
    }

    solveUpBuild = (r: FindReturn): boolean => {
      // console.log('YELLOW MIDDLE: solving up');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.U(0, false);
      }
      this.m.L(r.column);
      this.m.F();
      this.m.L(r.column, false);
      this.m.F(0, false);
      return true;
    }

    solveFrontBuild = (r: FindReturn): boolean => {
      // console.log('YELLOW MIDDLE: solving front');
      if (r.currentRow === r.row) {
        return false;
      }

      const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      // const futureRow = Math.floor(futurePos / this.sideLength);

      this.m.F();
      this.m.L(futureCol, false);
      this.m.U();
      this.m.U();
      this.m.L(futureCol);
      this.m.F(0, false);

      return true;
    }


    solveLeft = (row, column) => this.baseFind(row, column, this.ls.l, this.solveLeftBuild);

    solveFront = (row, column) => {
      if (this.baseFind(row, column, this.ls.f, this.solveFrontBuild)) {
        return this.solveUp(row, column);
      }
      return false;
    }

    solveRight = (row, column) => this.baseFind(row, column, this.ls.r, this.solveRightBuild);

    solveUp = (row, column) => this.baseFind(row, column, this.ls.u, this.solveUpBuild);

    solveDown = (row, column) => this.baseFind(row, column, this.ls.d, this.solveDownBuild);

    solveOrder = [
      this.solveDown,
      this.solveUp,
      this.solveLeft,
      this.solveFront,
      this.solveRight,
    ]


    solveCube = (row, column) => {
      if (!this.check(this.ls.f, this.getFaceDirection(row, column), this.ls.f)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
          if (this.solveOrder[i](row, column)) {
            break;
          }
        }
      }
    }

    lineLength = this.sideLength - 1;

    solve = () => {
      if (this.sideLength % 2 !== 0) {
        for (let col = 1; col < this.lineLength; col += 1) {
          // console.log(this.middle, col);
          if (col !== this.middle) {
            this.solveCube(this.middle, col);
            // for (let c = 1; c < col; c += 1) {
            //   if (!this.check(this.ls.f, this.getFaceDirection(this.middle, c), this.ls.f)) {
            //     console.log('INCORRECT AA');
            //     return false;
            //   }
            // }
          }
        }
      }
    }
}

export default SolveYellowMiddleLineRubik;
