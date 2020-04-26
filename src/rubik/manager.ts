import RubikSolver from './solver';
import RubikModel from './model';
import RubikView from './view';
import { ChangeSceneInterface, MainScene } from '../d';
import Move from './move';

class RubikManager {
  private rubikModel: RubikModel

  private rubikView: RubikView

  private rubikSolver: RubikSolver;

  private renderOrder: Map<string, number> = new Map();

  private scene: MainScene

  public constructor(scene: MainScene) {
    this.scene = scene;
    this.renderOrder.set('rubik', 0);

    this.addRubik(4);
  }

  private drawNewRubik() {
    this.scene.addRenderer(this.rubikView, this.renderOrder.get(this.rubikView.name));
    this.scene.addToScene(this.rubikView);
    this.scene.changeCamera(this.rubikView);
    this.rubikView.createMeshes();
    this.rubikView.colorizeRubik();
    this.rubikView.placeTextOnRubik(null);
    // this.rubikView.placeTextOnRubik([
    //   this.rubikModel.stRotations[0],
    //   this.rubikModel.opRotations[0],
    //   this.rubikModel.opRotations[2],
    //   this.rubikModel.stRotations[2],
    //   this.rubikModel.stRotations[0],
    //   this.rubikModel.opRotations[0],
    // ]);
  }

  private addRubik(length: number) {
    this.rubikModel = new RubikModel(length);
    this.rubikView = new RubikView(this.rubikModel);
    this.rubikSolver = new RubikSolver(this.rubikModel);
    this.drawNewRubik();
  }

  public scramble = () => {
    this.rubikModel.scramble(10);
    this.rubikView.startNextMove();
  }

  public solve = () => {
    const t0 = performance.now();
    this.rubikSolver.solve();
    const t1 = performance.now();
    console.log('Took', (t1 - t0).toFixed(4), 'milliseconds to solve');
    this.rubikView.startNextMove();
  }

  public sizeUp = () => {
    this.addRubik(this.rubikModel.sideLength + 1);
  }

  public sizeDown = () => {
    if (this.rubikModel.sideLength > 3) {
      this.addRubik(this.rubikModel.sideLength - 1);
    }
  }

  public prev = () => {
    this.rubikModel.moveBackward();
    this.rubikView.startNextMove();
  }

  public next = () => {
    this.rubikModel.moveForward();
    this.rubikView.startNextMove();
  }

  public addButtons = (div: HTMLElement) => {
    console.log('History');
    for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
      console.log(`Adding history: ${i}`);
      const button = document.createElement('button');
      div.appendChild(button);
      button.onclick = () => {
        this.rubikModel.jumpToHistoryIndex(i);
        this.rubikView.resetCubePositions();
        this.rubikView.colorizeRubik();
      };
    }
  }
}

export default RubikManager;
