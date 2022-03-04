import SolveStandardRubik from './solutions/solveStandardRubik';
import SolveWhiteCenterRubik from './solutions/solveWhiteCenterRubik';
import SolveYellowCenterRubik from './solutions/solveYellowCenterRubik';
import SolveBlueCenterRubik from './solutions/solveBlueCenterRubik';
import SolveYellowMiddleLineRubik from './solutions/solveYellowMiddleLineRubik';
import SolveRedCenterRubik from './solutions/solveRedCenterRubik';
import SolveGreenOrangeCenterRubik from './solutions/solveGreenOrangeCenterRubik';
import SolveEdgesRubik from './solutions/solveEdgesRubik';
import RubikModel from './model';

class RubikSolver {
  private solveWhiteCenterRubik: SolveWhiteCenterRubik;

  private solveYellowMiddleLineRubik: SolveYellowMiddleLineRubik;

  private solveYellowCenterRubik: SolveYellowCenterRubik;

  private solveBlueCenterRubik: SolveBlueCenterRubik;

  private solveRedCenterRubik: SolveRedCenterRubik;

  private solveGreenOrangeCenterRubik: SolveGreenOrangeCenterRubik;

  private solveEdgesRubik: SolveEdgesRubik;

  private solveStandardRubik: SolveStandardRubik;

  private rubikModel: RubikModel;

  constructor(rubikModel: RubikModel) {
    this.rubikModel = rubikModel;

    this.solveWhiteCenterRubik = new SolveWhiteCenterRubik(this.rubikModel);
    this.solveYellowMiddleLineRubik = new SolveYellowMiddleLineRubik(this.rubikModel);
    this.solveYellowCenterRubik = new SolveYellowCenterRubik(this.rubikModel);
    this.solveBlueCenterRubik = new SolveBlueCenterRubik(this.rubikModel);
    this.solveRedCenterRubik = new SolveRedCenterRubik(this.rubikModel);
    this.solveGreenOrangeCenterRubik = new SolveGreenOrangeCenterRubik(this.rubikModel);
    this.solveEdgesRubik = new SolveEdgesRubik(this.rubikModel);
    this.solveStandardRubik = new SolveStandardRubik(this.rubikModel);
  }

  public solve() {
    if (this.rubikModel.sideLength === 3) {
      this.solveStandardRubik.solve();
    } else {
      this.solveWhiteCenterRubik.solve();
      this.solveYellowMiddleLineRubik.solve();
      this.solveYellowCenterRubik.solve();
      this.solveBlueCenterRubik.solve();
      this.solveRedCenterRubik.solve();
      this.solveGreenOrangeCenterRubik.solve();
      this.solveEdgesRubik.solve();
      this.solveStandardRubik.solve();
    }
  }
}

export default RubikSolver;
