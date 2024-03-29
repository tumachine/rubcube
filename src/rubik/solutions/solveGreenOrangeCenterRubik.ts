import RubikSolutionBase from './rubikSolutionBase';
import { Side as s } from '../utils';
import { FindReturn } from './d';
import RubikModel from '../model';

class SolveGreenOrangeCenterRubik extends RubikSolutionBase {
  public constructor(r: RubikModel) {
    super(r);

    this.setLocalSidesAndMoves(s.b, s.f, s.u, s.d, s.l, s.r);

    this.interface[s.l] = [...this.r.stRotations[0]];
    this.interface[s.u] = [...this.r.opRotations[1]];

    this.primaryColor = this.ls.f;
  }

  // which lines not to touch, which moves were on settled columns
  solveUpBuild = (r: FindReturn): boolean => {
    // console.log('BLUE CENTER: solving up');
    for (let i = 0; i < r.rotations; i += 1) {
      this.m.U(0, false);
    }
    return true;
  }

  solveFront = (row: number, column: number) => {
    if (this.baseFind(row, column, this.ls.u, this.solveUpBuild)) {
      const currentPos = this.getFaceDirection(row, column);
      let futureCol = currentPos % this.sideLength;
      let futureRow = Math.floor(currentPos / this.sideLength);
      let futurePos;

      for (let i = 0; i < 3; i += 1) {
        futurePos = futureRow + (this.sideLength - 1 - futureCol) * this.sideLength;
        futureCol = futurePos % this.sideLength;
        futureRow = Math.floor(futurePos / this.sideLength);
      }

      const prevPos = row + (this.sideLength - 1 - column) * this.sideLength;
      const prevCol = prevPos % this.sideLength;
      const prevRow = Math.floor(prevPos / this.sideLength);

      this.m.L(column, false);

      if (column === prevCol) {
        this.m.U(0, false);
        this.m.L(futureCol, false);
        this.m.U();
        this.m.L(column);
        this.m.U(0, false);
        this.m.L(futureCol);
      } else {
        this.m.U();
        this.m.L(prevCol, false);
        this.m.U(0, false);
        this.m.L(column);
        this.m.U();
        this.m.L(prevCol);
      }
      return true;
    }
    return false;
  }

  solveCube = (row: number, column: number) => {
    for (let i = 0; i < 4; i += 1) {
      if (!this.check(this.ls.f, this.getFaceDirection(row, column), this.ls.f)) {
        this.solveFront(row, column);
      }
    }
  }

  solve = () => {
    const lineLength = this.sideLength - 1;
    //   this.solveCube(2, 1);

    for (let col = 1; col < lineLength; col += 1) {
      for (let row = 1; row < lineLength; row += 1) {
        this.solveCube(row, col);
        // for (let c = 1; c < col; c += 1) {
        //   if (!this.check(this.ls.u, this.getFaceDirection(row, c), this.ls.f)) {
        //     // console.log('INCORRECT AA');
        //     return false;
        //   }
        // }
      }
      // console.log('COMPLETE');
    }

    // for (let c = 1; c < lineLength; c += 1) {
    //   for (let r = 1; r < lineLength; r += 1) {
    //     if (!this.check(this.ls.f, this.getFaceDirection(r, c), this.ls.f)) {
    //       console.log('INCORRECT solution');
    //       return false;
    //     }
    //     if (!this.check(this.ls.u, this.getFaceDirection(r, c), this.ls.u)) {
    //       console.log('INCORRECT solution');
    //       return false;
    //     }
    //   }
    // }
  }
}

export default SolveGreenOrangeCenterRubik;
