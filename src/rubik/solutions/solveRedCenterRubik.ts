/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import { sides as s } from '../utils';
import { FindReturn } from './d';
import RubikModel from '../model';

class SolveRedCenterRubik extends RubikSolutionBase {
  public constructor(r: RubikModel) {
    super(r);
    this.m.L = this.r.m.B;
    this.m.R = this.r.m.F;
    this.m.F = this.r.m.L;
    this.m.B = this.r.m.R;
    this.m.U = this.r.m.U;
    this.m.D = this.r.m.D;

    this.ls = {
      f: s.l,
      d: s.d,
      u: s.u,
      l: null,
      r: null,
      b: null,
    };

    this.interface[s.l] = [...this.r.opRotations[2]];
    this.interface[s.u] = [...this.r.stRotations[3]];
    this.interface[s.d] = [...this.r.opRotations[1]];

    this.primaryColor = this.ls.d;
  }

    solveUpBuild = (r: FindReturn): boolean => {
      // console.log('RED CENTER: solving up');
      for (let i = 0; i < r.rotations; i += 1) {
        this.m.U();
      }

      this.m.L(r.column);
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
      if (this.sideLength % 2 === 0) {
        this.m.U();
        this.m.U();
      } else {
        if (r.column === this.middle) {
          this.m.U();
        } else {
          this.m.U();
          this.m.U();
        }
      }
      // if (r.column === this.middle) {
      //   this.m.U();
      // } else {
      //   this.m.U();
      //   this.m.U();
      // }
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

      this.m.F(0, false);
      this.m.L(futureCol, false);

      if (this.sideLength % 2 === 0) {
        this.m.U();
        this.m.U();
      } else {
        if (futureCol === this.middle) {
          this.m.U();
        } else {
          this.m.U();
          this.m.U();
        }
      }

      // if (futureCol === this.middle) {
      //   this.m.U();
      // } else {
      //   this.m.U();
      //   this.m.U();
      // }

      this.m.L(futureCol);
      this.m.F();
      return true;
    }


    solveDown = (row, column) => {
      if (this.baseFind(row, column, this.ls.d, this.solveDownBuild)) {
        this.solveUp(row, column);
        return true;
      }
      return false;
    }

    solveFront = (row, column) => {
      if (this.baseFind(row, column, this.ls.f, this.solveFrontBuild)) {
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

      if (this.sideLength % 2 === 0) {
        if (row < this.middle) {
          this.m.U();
        } else {
          this.m.U();
          this.m.U();
        }
      } else {
        if (row <= this.middle) {
          this.m.U();
        } else {
          this.m.U();
          this.m.U();
        }
      }

      // if (row <= this.middle) {
      //   this.m.U();
      // } else {
      //   this.m.U();
      //   this.m.U();
      // }
      this.m.L(row, false);
      this.solveUp(row, column);
      return true;
    }

    solveUp = (row, column) => this.baseFind(row, column, this.ls.u, this.solveUpBuild);

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
      if (this.baseFind(row, column, this.ls.d, this.solveDownFirstBuild)) {
        this.solveFrontFirst(row, column);
        return true;
      }
      return false;
    }

    solveFrontFirst = (row, column) => this.baseFind(row, column, this.ls.f, this.solveFrontFirstBuild);

    solveUpFirst = (row, column) => this.baseFind(row, column, this.ls.u, this.solveUpFirstBuild);

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

      for (let row = 1; row < this.lineLength; row += 1) {
        this.solveFirstCube(row);
        // if (!this.check(this.ls.f, this.getFaceDirection(row, row), this.ls.d)) {
        //   console.log('INCORRECT opposite');
        //   return false;
        // }
        for (let col = 1; col < this.lineLength; col += 1) {
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
      for (let c = 1; c < this.lineLength; c += 1) {
        for (let r = 1; r < this.lineLength; r += 1) {
          if (!this.check(this.ls.d, this.getFaceDirection(r, c), this.ls.d)) {
            console.log('INCORRECT solution');
            return false;
          }
        }
      }
    }
}

export default SolveRedCenterRubik;
