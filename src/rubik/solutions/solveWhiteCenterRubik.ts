/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import { FindReturn } from './d';
import { Side as s } from '../utils';
import RubikModel from '../model';


class SolveWhiteCenterRubik extends RubikSolutionBase {
  public constructor(r: RubikModel) {
    super(r);
    this.m = this.r.m;

    this.interface[s.l] = [...this.r.stRotations[0]];
    this.interface[s.r] = [...this.r.opRotations[0]];
    this.interface[s.u] = [...this.r.opRotations[2]];
    this.interface[s.d] = [...this.r.stRotations[2]];
    this.interface[s.f] = [...this.r.stRotations[0]];
    this.interface[s.b] = [...this.r.opRotations[0]];

    this.primaryColor = s.f;
  }

  solveLeftBuild = (r: FindReturn): boolean => {
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.L(0, false);
    }
    this.m.D(r.row);
    return true;
  }

  solveRightBuild = (r: FindReturn): boolean => {
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.R(0, false);
    }
    this.m.D(r.row, false);
    return true;
  }

  solveBackBuild = (r: FindReturn): boolean => {
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.B(0, false);
    }
    this.m.D(r.row);
    this.m.D(r.row);
    return true;
  }

  solveDownBuild = (r: FindReturn): boolean => {
    const rotatedFront = Math.abs(r.currentCol - (this.sideLength - 1));
    if (rotatedFront >= r.column) {
      this.m.D();
      this.m.F(rotatedFront, false);
      this.m.D(0, false);
      return true;
    }
    return false;
  }

  solveFrontBuild = (r: FindReturn): boolean => {
    const futurePos = r.currentRow + (this.sideLength - 1 - r.currentCol) * this.sideLength;
    const futureRow = Math.floor(futurePos / this.sideLength);
    if (r.currentCol !== r.column) {
      this.m.F();
      this.m.D(futureRow);
      this.m.F(0, false);
      return true;
    }
    return false;
  }

  solveUpBuild = (row, column): boolean => {
    const { highestPos, found } = this.findHighestPos(row, column, s.u);
    if (found) {
      for (let i = 0; i < 4; i += 1) {
        if (this.check(s.u, highestPos, s.f)) {
          const moveRow = Math.floor(highestPos / this.sideLength);
          this.m.D();
          this.m.F(moveRow);
          this.m.D(0, false);
          return true;
        }
        this.m.U();
      }
    }
    return false;
  }

  solveLeft = (row, column) => this.baseFind(row, column, s.l, this.solveLeftBuild);

  solveRight = (row, column) => this.baseFind(row, column, s.r, this.solveRightBuild);

  solveBack = (row, column) => this.baseFind(row, column, s.b, this.solveBackBuild);

  solveFront = (row, column) => {
    if (this.baseFind(row, column, s.f, this.solveFrontBuild)) {
      return this.solveRight(row, column);
    }
    return false;
  }

  solveUp = (row, column) => {
    if (this.solveUpBuild(row, column)) {
      return this.solveRight(row, column);
    }
    return false;
  }

  solveDown = (row, column) => {
    if (this.baseFind(row, column, s.d, this.solveDownBuild)) {
      return this.solveRight(row, column);
    }
    return false;
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

  solve = () => {
    const lineLength = this.sideLength - 1;

    for (let col = 1; col < lineLength; col += 1) {
      for (let row = 1; row < lineLength; row += 1) {
        this.solveCube(row, col);
        // if (!this.check(s.f, this.getFaceDirection(row, col), s.f)) {
        //   console.log('INCORRECT');
        //   return false;
        // }
      }
      this.m.L(col);
    }

    for (let col = 1; col < lineLength; col += 1) {
      this.m.L(col, false);
    }

    // for (let c = 1; c < lineLength; c += 1) {
    //   for (let r = 1; r < lineLength; r += 1) {
    //     if (!this.check(s.f, this.getFaceDirection(r, c), s.f)) {
    //       console.log('INCORRECT solution');
    //       return false;
    //     }
    //   }
    // }
  }
}


export default SolveWhiteCenterRubik;
