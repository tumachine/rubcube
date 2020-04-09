/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import { OperationAfterFound, FindReturn } from './d';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';


class SolveWhiteCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = rubik.moves;

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[0]];
    this.interface[s.r] = [...this.rubik.opRotations[0]];
    this.interface[s.u] = [...this.rubik.opRotations[2]];
    this.interface[s.d] = [...this.rubik.stRotations[2]];
    this.interface[s.f] = [...this.rubik.stRotations[0]];
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    this.primaryColor = s.f;
  }

  localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

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

    solveLeft = (row, column) => this.localFind(row, column, s.l, this.solveLeftBuild);

    solveRight = (row, column) => this.localFind(row, column, s.r, this.solveRightBuild);

    solveBack = (row, column) => this.localFind(row, column, s.b, this.solveBackBuild);

    solveFront = (row, column) => {
      if (this.localFind(row, column, s.f, this.solveFrontBuild)) {
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
      if (this.localFind(row, column, s.d, this.solveDownBuild)) {
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
          if (!this.check(s.f, this.getFaceDirection(row, col), s.f)) {
            this.solveCube(row, col);
            if (!this.check(s.f, this.getFaceDirection(row, col), s.f)) {
              console.log('INCORRECT');
              return false;
            }
          }
        }
        this.m.L(col);
      }

      for (let col = 1; col < lineLength; col += 1) {
        this.m.L(col, false);
      }
    }
}


export default SolveWhiteCenterRubik;
