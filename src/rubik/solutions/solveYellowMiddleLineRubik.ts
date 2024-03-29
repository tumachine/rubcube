import RubikSolutionBase from './rubikSolutionBase';
import { Side as s } from '../utils';
import { FindReturn } from './d';
import RubikModel from '../model';

class SolveYellowMiddleLineRubik extends RubikSolutionBase {
  public constructor(r: RubikModel) {
    super(r);

    this.setLocalSidesAndMoves(s.r, s.l, s.u, s.d, s.b, s.f);

    this.interface[s.l] = [...this.r.stRotations[1]];
    this.interface[s.r] = [...this.r.opRotations[1]];
    this.interface[s.u] = [...this.r.opRotations[0]];
    this.interface[s.d] = [...this.r.stRotations[0]];
    this.interface[s.b] = [...this.r.opRotations[0]];

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


  solveLeft = (row: number, column: number) => this.baseFind(row, column, this.ls.l, this.solveLeftBuild);

  solveFront = (row: number, column: number) => {
    if (this.baseFind(row, column, this.ls.f, this.solveFrontBuild)) {
      return this.solveUp(row, column);
    }
    return false;
  }

  solveRight = (row: number, column: number) => this.baseFind(row, column, this.ls.r, this.solveRightBuild);

  solveUp = (row: number, column: number) => this.baseFind(row, column, this.ls.u, this.solveUpBuild);

  solveDown = (row: number, column: number) => this.baseFind(row, column, this.ls.d, this.solveDownBuild);

  solveOrder = [
    this.solveDown,
    this.solveUp,
    this.solveLeft,
    this.solveFront,
    this.solveRight,
  ]


  solveCube = (row: number, column: number) => {
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
