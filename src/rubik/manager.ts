import RubikSolver from './solver';
import RubikModel from './model';
import RubikView from './view';
import { sides as s, sidesStr, sidesArr } from './utils';
import { ChangeSceneInterface, MainScene } from '../d';
import Move from './move';
import { MoveInterface } from './moveActions';

class RubikManager {
  private rubikModel: RubikModel

  private rubikView: RubikView

  private rubikSolver: RubikSolver;

  private renderOrder: Map<string, number> = new Map();

  private scene: MainScene

  private moveOrientation: MoveInterface[]

  private moveRotation: number

  private currentMoveRotations: MoveInterface[][]

  private historyDiv: HTMLDivElement

  private movementDiv: HTMLDivElement

  private orientationDiv: HTMLDivElement

  private historyButtons: HTMLButtonElement[]

  private historyButtonPrevActive: HTMLButtonElement

  private historyButtonActiveColor: string = '#868588'

  private historyButtonNotActiveColor: string = '#4CAF50';

  public constructor(scene: MainScene, historyDiv: HTMLDivElement, movementDiv: HTMLDivElement, orientationDiv: HTMLDivElement) {
    this.scene = scene;
    this.historyDiv = historyDiv;
    this.movementDiv = movementDiv;
    this.orientationDiv = orientationDiv;
    this.renderOrder.set('rubik', 0);

    this.addRubik(4);

    this.createOrientationButtons();
  }

  private drawNewRubik() {
    this.scene.addRenderer(this.rubikView, this.renderOrder.get(this.rubikView.name));
    this.scene.addToScene(this.rubikView);
    this.scene.changeCamera(this.rubikView);

    this.rubikView.createMeshes();
    this.rubikView.colorizeRubik();
    this.rubikView.placeTextOnRubik(null);
  }

  private addRubik(length: number) {
    this.rubikModel = new RubikModel(length);
    this.rubikView = new RubikView(this.rubikModel);
    this.rubikSolver = new RubikSolver(this.rubikModel);

    this.moveRotation = 0;
    this.moveOrientation = this.rubikModel.moveRotations[s.f][this.moveRotation];
    this.historyButtons = [];
    this.clearMoveButtons();
    this.clearHistoryButtons();

    this.createMovementButtons();

    this.drawNewRubik();
  }

  public scramble = () => {
    this.rubikModel.scramble(2);
    this.refreshHistoryButtons();
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
    this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
    this.switchButtonBackgroundColor(this.historyButtons[this.rubikModel.currentHistoryIndex], true);
    this.historyButtonPrevActive = this.historyButtons[this.rubikModel.currentHistoryIndex];
    this.rubikView.startNextMove();
  }

  public next = () => {
    this.rubikModel.moveForward();
    this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
    this.switchButtonBackgroundColor(this.historyButtons[this.rubikModel.currentHistoryIndex], true);
    this.historyButtonPrevActive = this.historyButtons[this.rubikModel.currentHistoryIndex];
    this.rubikView.startNextMove();
  }

  private refreshHistoryButtons = () => {
    this.clearHistoryButtons();
    this.addAllHistoryButtons();
    this.historyButtonPrevActive = this.historyButtons[this.rubikModel.currentHistoryIndex];
    this.switchButtonBackgroundColor(this.historyButtonPrevActive, true);
    for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
      this.historyDiv.appendChild(this.historyButtons[i]);
    }
  }

  private switchButtonBackgroundColor = (button: HTMLButtonElement, active: boolean) => {
    if (active) {
      button.style.backgroundColor = this.historyButtonActiveColor;
    } else {
      button.style.backgroundColor = this.historyButtonNotActiveColor;
    }
  }

  private addHistoryButton = (index: number) => {
    const button = document.createElement('button');

    const move = this.rubikModel.moveHistory[index];
    if (move !== null) {
      button.innerHTML = `${move.side}${move.clockwise ? '' : "'"}${move.slice === 0 ? '' : move.slice + 1}`;
    }

    button.onclick = () => {
      this.rubikModel.jumpToHistoryIndex(index);
      this.rubikView.resetCubePositions();
      this.rubikView.colorizeRubik();
      this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
      this.switchButtonBackgroundColor(button, true);
      this.historyButtonPrevActive = button;
    };
    this.historyButtons.push(button);
  }

  private addAllHistoryButtons = () => {
    // console.log('History');
    for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
      // console.log(`Adding history: ${i}`);
      this.addHistoryButton(i);
    }
  }

  private clearHistoryButtons = () => {
    this.historyDiv.innerHTML = '';
    this.historyButtons = [];
  }

  private clearMoveButtons = () => {
    this.movementDiv.innerHTML = '';
  }

  private createMovementButtons = () => {
    for (let i = 0; i < Math.abs(this.rubikModel.sideLength / 2); i += 1) {
      this.addButtonPair(i, s.l);
      this.addButtonPair(i, s.r);
      this.addButtonPair(i, s.u);
      this.addButtonPair(i, s.d);
      this.addButtonPair(i, s.f);
      this.addButtonPair(i, s.b);
    }
  }

  private addButtonPair = (slice: number, sideNum: number) => {
    const buttonClockwise = this.createMovementButton(slice, true, sideNum);
    const buttonCounter = this.createMovementButton(slice, false, sideNum);
    this.movementDiv.appendChild(buttonClockwise);
    this.movementDiv.appendChild(buttonCounter);
  }

  private createMovementButton = (slice: number, clockwise: boolean, sideNum: number): HTMLButtonElement => {
    const button = document.createElement('button');
    button.innerHTML = `${sidesStr[sideNum]}${clockwise ? '' : "'"}${slice === 0 ? '' : slice + 1}`;

    button.onclick = () => {
      // this.moveOrientation[sideNum](slice, clockwise);
      this.rubikModel.addMove(this.moveOrientation[sideNum], slice, clockwise);

      this.clearHistoryButtons();
      this.refreshHistoryButtons();
      this.rubikView.startNextMove();
    };
    return button;
  }

  // change orientation
  // with that change, update move
  // total possible orientations 6 sides * 4 rotations = 24
  private createOrientationButtons = () => {
    for (let i = 0; i < sidesArr.length; i += 1) {
      const button = document.createElement('button');
      button.innerHTML = sidesStr[i];
      button.onclick = () => {
        this.changeOrientation(i);
      };
      this.orientationDiv.appendChild(button);
    }
  }

  private changeOrientation = (side: number) => {
    this.currentMoveRotations = this.rubikModel.moveRotations[side];
    this.moveOrientation = this.currentMoveRotations[this.moveRotation];
  }

  public rotateCurrentOrientation = (clockwise: boolean = true) => {
    if (clockwise) {
      this.moveRotation = (this.moveRotation + 1) % 4;
    } else {
      this.moveRotation = (Math.abs(this.moveRotation - 1)) % 4;
    }
    this.moveOrientation = this.currentMoveRotations[this.moveRotation];
  }
}

export default RubikManager;
