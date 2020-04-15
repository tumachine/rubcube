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
    this.interface[s.l] = [...this.rubik.stRotations[2]];
    this.interface[s.r] = [...this.rubik.opRotations[0]];
    this.interface[s.u] = [...this.rubik.opRotations[3]];
    this.interface[s.d] = [...this.rubik.stRotations[1]];
    this.interface[s.f] = null;
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    this.primaryColor = this.ls.f;
  }

    localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

    middle = Math.floor(this.sideLength / 2);

    solveLeftBuild = (r: FindReturn): boolean => {
      console.log('YELLOW CENTER: solving left');
      if (r.currentRow === r.row) {
        return false;
      }
      this.m.L();

      const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      // const futureRow = Math.floor(futurePos / this.sideLength);
      this.m.B(futureCol, false);
      this.m.L(0, false);
      return true;
    }

    solveRightBuild = (r: FindReturn): boolean => {
      console.log('YELLOW CENTER: solving right');
      // console.log('solving right');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.R(0, false);
      }
      this.m.B(r.column);
      this.m.B(r.column);
      return true;
    }

    solveDownBuild = (r: FindReturn): boolean => {
      console.log('YELLOW CENTER: solving down');
      // console.log('solving down');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.D(0, false);
      }
      this.m.B(r.column, false);
      return true;
    }

    solveFrontBuild = (r: FindReturn): boolean => {
      console.log('YELLOW CENTER: solving front');
      if (r.currentRow < r.row) {
        return false;
      }

      const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      // const futureRow = Math.floor(futurePos / this.sideLength);

      this.m.F();
      this.m.L(futureCol, false);
      // maybe up once or twice
      this.m.U();
      this.m.U();
      this.m.L(futureCol);
      this.m.F(0, false);
      return true;
    }

    solveUpBuild = (r: FindReturn): boolean => {
      console.log('YELLOW CENTER: solving up');
      // console.log('solving up');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.U(0, false);
      }
      this.m.B(r.column);
      return true;
    }

    solveLeft = (row, column) => {
      if (this.localFind(row, column, this.ls.l, this.solveLeftBuild)) {
        return this.solveUp(row, column);
      }
      return false;
    }

    solveFront = (row, column) => {
      if (this.localFind(row, column, this.ls.f, this.solveFrontBuild)) {
        return this.solveUp(row, column);
      }
      return false;
    }

    solveRight = (row, column) => this.localFind(row, column, this.ls.r, this.solveRightBuild);

    solveUp = (row, column) => this.localFind(row, column, this.ls.u, this.solveUpBuild);

    solveDown = (row, column) => this.localFind(row, column, this.ls.d, this.solveDownBuild);

    solveOrder = [
      this.solveLeft,
      this.solveFront,
      this.solveUp,
      this.solveRight,
      this.solveDown,
    ]


    solveCube = (row, column) => {
      if (!this.check(this.ls.l, this.getFaceDirection(row, column), this.ls.f)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
          if (this.solveOrder[i](row, column)) {
            break;
          }
        }
      }
    }

    lineLength = this.sideLength - 1;

    solve = () => {
      for (let row = 1; row < this.lineLength; row += 1) {
        if (row !== this.middle) {
          for (let col = 1; col < this.lineLength; col += 1) {
            console.log(row, col);
            this.solveCube(row, col);
            // for (let c = 1; c < col; c += 1) {
            //   if (!this.check(this.ls.l, this.getFaceDirection(row, c), this.ls.f)) {
            //     console.log('INCORRECT ROW');
            //     return false;
            //   }
            // }
          }
          // for top mid
          if (row > this.middle) {
            this.m.F();
            this.m.F();
            this.m.D(row);
            this.m.F();
            this.m.F();
            this.m.D(row, false);
          } else if (row < this.middle) {
          // for bot mid
            this.m.D(row);
            this.m.F();
            this.m.F();
            this.m.D(row, false);
            this.m.F();
            this.m.F();
          }
        }
        // console.log('passed row');
        // for (let r = 1; r < row; r += 1) {
        //   for (let c = 1; c < this.lineLength; c += 1) {
        //     if (!this.check(this.ls.f, this.getFaceDirection(r, c), this.ls.f)) {
        //         console.log('INCORRECT BUILD');
        //         return false;
        //       }
        //     }
        //   }
        // }
      }
    }
}

export default SolveYellowCenterRubik;
