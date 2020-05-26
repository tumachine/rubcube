/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import { Side as s } from '../utils';
import { FindReturn } from './d';
import RubikModel from '../model';
import MoveActions from '../moveActions';


class SolveYellowCenterRubik extends RubikSolutionBase {
  public constructor(r: RubikModel) {
    super(r);

    this.setLocalSidesAndMoves(s.r, s.l, s.u, s.d, s.b, s.f);

    this.interface[s.l] = [...this.r.stRotations[2]];
    this.interface[s.r] = [...this.r.opRotations[0]];
    this.interface[s.u] = [...this.r.opRotations[3]];
    this.interface[s.d] = [...this.r.stRotations[1]];
    this.interface[s.f] = null;
    this.interface[s.b] = [...this.r.opRotations[0]];

    this.primaryColor = this.ls.f;
  }

  solveLeftBuild = (r: FindReturn): boolean => {
    // console.log('YELLOW CENTER: solving left');
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
    // console.log('YELLOW CENTER: solving right');
    // console.log('solving right');
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.R(0, false);
    }
    this.m.B(r.column);
    this.m.B(r.column);
    return true;
  }

  solveDownBuild = (r: FindReturn): boolean => {
    // console.log('YELLOW CENTER: solving down');
    // console.log('solving down');
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.D(0, false);
    }
    this.m.B(r.column, false);
    return true;
  }

  solveFrontBuild = (r: FindReturn): boolean => {
    // console.log('YELLOW CENTER: solving front');
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
    // console.log('YELLOW CENTER: solving up');
    // console.log('solving up');
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.U(0, false);
    }
    this.m.B(r.column);
    return true;
  }

  solveLeft = (row, column) => {
    if (this.baseFind(row, column, this.ls.l, this.solveLeftBuild)) {
      return this.solveUp(row, column);
    }
    return false;
  }

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
    if (this.sideLength % 2 === 0) {
      for (let row = 1; row < this.lineLength; row += 1) {
        for (let col = 1; col < this.lineLength; col += 1) {
          this.solveCube(row, col);
        }
        // for top mid
        if (row >= this.middle) {
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
    } else {
      for (let row = 1; row < this.lineLength; row += 1) {
        if (row !== this.middle) {
          for (let col = 1; col < this.lineLength; col += 1) {
            // console.log(row, col);
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

    // for (let c = 1; c < this.lineLength; c += 1) {
    //   for (let r = 1; r < this.lineLength; r += 1) {
    //     if (!this.check(this.ls.f, this.getFaceDirection(r, c), this.ls.f)) {
    //       console.log('INCORRECT solution');
    //       return false;
    //     }
    //   }
    // }
  }
}

export default SolveYellowCenterRubik;
