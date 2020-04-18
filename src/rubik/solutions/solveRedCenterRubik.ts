/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';
import { OperationAfterFound, FindReturn } from './d';

class SolveRedCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  // local sides
  private ls;

  private moveHistory: Function[];

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = new MoveActions();
    this.m.L = rubik.moves.B;
    this.m.R = rubik.moves.F;
    this.m.F = rubik.moves.L;
    this.m.B = rubik.moves.R;
    this.m.U = rubik.moves.U;
    this.m.D = rubik.moves.D;

    this.ls = {
      f: s.l,
      d: s.d,
      u: s.u,
    };

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.opRotations[2]];
    this.interface[s.u] = [...this.rubik.stRotations[3]];
    this.interface[s.d] = [...this.rubik.opRotations[1]];

    this.primaryColor = this.ls.d;
    this.moveHistory = [];
  }

    localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

    middle = Math.floor(this.sideLength / 2);


    solveUpBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving up');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.U();
      }

      this.m.L(r.column);
      // if (r.row > this.middle && r.column > this.middle) {
      //   this.m.F();
      //   this.m.L(r.column, false);
      //   this.m.F(0, false);
      // } else {
      this.m.F(0, false);
      this.m.L(r.column, false);
      this.m.F();
      // }
      return true;
    }

    solveDownBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving down');
      if (r.currentCol < r.row) {
        return false;
      }
      this.m.F(0, false);
      this.m.L(r.currentCol, false);
      this.m.L(r.currentCol, false);
      // rotate once or twice
      if (r.column === this.middle) {
        this.m.U();
      } else {
        this.m.U();
        this.m.U();
      }
      this.m.L(r.currentCol);
      this.m.L(r.currentCol);
      this.m.F();
      return true;
    }

    solveFrontBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving front');
      if (r.currentRow === r.row) {
        return false;
      }

      if (r.currentRow === r.row && r.currentCol === r.row) {
        return false;
      }

      const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);

      // console.log(r.nextPos);
      // console.log(futurePos);
      // console.log(futureCol);

      this.m.F(0, false);
      this.m.L(futureCol, false);


      if (futureCol === this.middle) {
        this.m.U();
      } else {
        this.m.U();
        this.m.U();
      }

      this.m.L(futureCol);
      this.m.F();
      return true;
    }


    solveDown = (row, column) => {
      if (this.localFind(row, column, this.ls.d, this.solveDownBuild)) {
        this.solveUp(row, column);
        return true;
      }
      return false;
    }

    solveFront = (row, column) => {
      if (this.localFind(row, column, this.ls.f, this.solveFrontBuild)) {
        this.solveUp(row, column);
        return true;
      }
      return false;
    }

    solveBack = (row, column) => {
      // console.log('RED CENTER: solving back');

      const futurePos = row + (this.sideLength - 1 - column) * this.sideLength;
      const futureCol = futurePos % this.sideLength;
      const futureRow = Math.floor(futurePos / this.sideLength);

      this.m.L(row);

      if (row <= this.middle) {
        this.m.U();
      } else {
        this.m.U();
        this.m.U();
      }
      this.m.L(row, false);
      this.solveUp(row, column);
      return true;
    }

    solveUp = (row, column) => this.localFind(row, column, this.ls.u, this.solveUpBuild);

    solveOrder = [
      this.solveFront,
      this.solveUp,
      this.solveDown,
      this.solveBack,
    ]

    solveCube = (row, column) => {
      if (!this.check(this.ls.f, this.getFaceDirection(row, column), this.ls.d)) {
        for (let i = 0; i < this.solveOrder.length; i += 1) {
          if (this.solveOrder[i](row, column)) {
            break;
          }
        }
      }
    }

    solveUpFirstBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving up first');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.U();
      }
      this.m.L(r.column);

      this.m.F(0, false);
      this.m.F(0, false);

      this.m.L(r.column, false);

      this.m.F(0, false);
      this.m.F(0, false);
      return true;
    }

    solveDownFirstBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving down first');
      const opposite = Math.abs(r.column + 1 - this.sideLength);
      if (r.currentCol < opposite) {
        return false;
      }

      this.m.L(r.currentCol, false);

      this.m.F(0, false);
      this.m.F(0, false);

      this.m.L(r.currentCol);

      this.m.F(0, false);
      this.m.F(0, false);
      return true;
    }

    solveFrontFirstBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving front first');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.F();
      }
      return true;
    }


    solveDownFirst = (row, column) => {
      if (this.localFind(row, column, this.ls.d, this.solveDownFirstBuild)) {
        this.solveFrontFirst(row, column);
        return true;
      }
      return false;
    }

    solveFrontFirst = (row, column) => this.localFind(row, column, this.ls.f, this.solveFrontFirstBuild);

    solveUpFirst = (row, column) => this.localFind(row, column, this.ls.u, this.solveUpFirstBuild);

    solveFirstOrder = [
      this.solveDownFirst,
      this.solveFrontFirst,
      this.solveUpFirst,
    ]

    solveFirstCube = (column) => {
      const opposite = this.sideLength - column - 1;
      // console.log(`Opposite: ${opposite}`);
      if (!this.check(this.ls.f, this.getFaceDirection(opposite, opposite), this.ls.d)) {
        for (let i = 0; i < this.solveFirstOrder.length; i += 1) {
          if (this.solveFirstOrder[i](opposite, opposite)) {
            this.m.L(column, false);
            this.m.F();
            this.m.F();
            break;
          }
        }
      } else {
        this.m.L(column, false);
        this.m.F();
        this.m.F();
      }
    }

    solve = () => {
      const lineLength = this.sideLength - 1;
      // this.solveFirstCube(5);
      // if (!this.check(this.ls.f, this.getFaceDirection(5, 5), this.ls.d)) {
      //   console.log('INCORRECT AA');
      //   return false;
      // }

      // for (let col = 1; col < lineLength; col += 1) {
      //   console.log(col, col);
      //   console.log(this.getFaceDirection(col, col));
      //   this.solveFirstCube(col);
      //   if (!this.check(this.ls.f, this.getFaceDirection(col, col), this.ls.d)) {
      //     console.log('INCORRECT AA');
      //     return false;
      //   }
      //   this.m.L(col);
      // }

      for (let row = 1; row < lineLength; row += 1) {
        this.solveFirstCube(row);
        // if (!this.check(this.ls.f, this.getFaceDirection(row, row), this.ls.d)) {
        //   console.log('INCORRECT opposite');
        //   return false;
        // }
        for (let col = 1; col < lineLength; col += 1) {
          // console.log(row, col);
          if (col !== row) {
            this.solveCube(row, col);
          }

          // if (!this.check(this.ls.f, this.getFaceDirection(row, col), this.ls.d)) {
          //   console.log('INCORRECT small');
          //   return false;
          // }

          // for (let c = 1; c < col; c += 1) {
          //   if (!this.check(this.ls.f, this.getFaceDirection(row, c), this.ls.d)) {
          //     console.log('INCORRECT AA');
          //     return false;
          //   }
          // }

          // for (let c = 1; c < row - 1; c += 1) {
          //   for (let r = 1; r < lineLength; r += 1) {
          //     if (!this.check(this.ls.d, this.getFaceDirection(r, c), this.ls.d)) {
          //       console.log('INCORRECT solution');
          //       return false;
          //     }
          //   }
          // }
        }
        this.m.F(0, false);
        this.m.L(row);
        // console.log('COMPLETE');
      }
      for (let c = 1; c < lineLength; c += 1) {
        for (let r = 1; r < lineLength; r += 1) {
          if (!this.check(this.ls.d, this.getFaceDirection(r, c), this.ls.d)) {
            console.log('INCORRECT solution');
            return false;
          }
        }
      }
    }
}

export default SolveRedCenterRubik;
