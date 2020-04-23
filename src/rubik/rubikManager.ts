import RubikModel from './model';
import RubikView from './view';
import SolveStandardRubik from './solutions/solveStandardRubik';
import SolveWhiteCenterRubik from './solutions/solveWhiteCenterRubik'
import SolveYellowCenterRubik from './solutions/solveYellowCenterRubik';
import SolveBlueCenterRubik from './solutions/solveBlueCenterRubik';
import SolveYellowMiddleLineRubik from './solutions/solveYellowMiddleLineRubik';
import SolveRedCenterRubik from './solutions/solveRedCenterRubik';
import SolveGreenOrangeCenterRubik from './solutions/solveGreenOrangeCenterRubik';
import SolveEdgesRubik from './solutions/solveEdgesRubik';

class RubikManager {
    private solveWhiteCenterRubik: SolveWhiteCenterRubik;

    private solveYellowMiddleLineRubik: SolveYellowMiddleLineRubik;

    private solveYellowCenterRubik: SolveYellowCenterRubik;

    private solveBlueCenterRubik: SolveBlueCenterRubik;

    private solveRedCenterRubik: SolveRedCenterRubik;

    private solveGreenOrangeCenterRubik: SolveGreenOrangeCenterRubik;

    private solveEdgesRubik: SolveEdgesRubik;

    private solveStandardRubik: SolveStandardRubik;

    private rubikModel: RubikModel;

    private rubikView: RubikView;

    constructor(sideLength: number) {
      this.rubikModel = new RubikModel(sideLength);
      this.rubikView = new RubikView(this.rubikModel);

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

    addToScene(scene: THREE.Scene) {
      const rubik3DObject = scene.getObjectByName('rubik');
      if (rubik3DObject !== undefined) {
        scene.remove(rubik3DObject);
      }

      this.rubikView.rubik.name = 'rubik';
      scene.add(this.rubikView.rubik);

      console.log('Added rubik to scene');
    }

    colorize() {
      this.rubikView.colorizeRubik();
    }

    numberize() {
      this.rubikView.placeTextOnRubik();
    }

    adjustCameraToRubik(camera: THREE.PerspectiveCamera) {
      const length = this.rubikModel.sideLength;
      camera.position.set(length * 1.5, length * 1.2, length * 2);
      camera.far = length * 4;
      camera.updateProjectionMatrix();
      // this.camera.lookAt(this.controls.target);
    }

    scramble(moves: number) {
      if (this.rubikView.rubikModel.sideLength > 3) {
        this.rubikView.rubikModel.generateRandomMoves(moves, true);
      } else {
        this.rubikView.rubikModel.generateRandomMoves(moves);
      }
    }

    animate() {
      this.rubikView.startNextMove();
    }

    render() {
      this.rubikView.render();
    }
}

export default RubikManager;
