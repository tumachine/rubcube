/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';
import { OperationAfterFound } from './d';

class SolveBlueCenterRubik extends RubikSolutionBase {
  private m: MoveActions;

  // local sides
  private ls;

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
  }

    localFind = (row: number, col: number, side: number, operation: OperationAfterFound) => this.baseFind(row, col, side, operation);

    solveBackBuild = (nextPos, origPos, column, row, currentCol, currentRow) => {
      console.log('BLUE CENTER: solving back');
      if (this.check(this.ls.b, origPos, this.ls.f)) {
        this.m.B(row);
        break;
      }
      this.m.R();
    }

    // solveBack = (row, column) => {
    //   this.localFind(row, column, this.ls.b, );
    // }
}

export default SolveBlueCenterRubik;
