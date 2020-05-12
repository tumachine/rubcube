import RubikSolver from './solver';
import RubikModel from './model';
import RubikView from './view';
import { sides as s, sidesStr, sidesArr, createCamera, sides } from './utils';
import { MoveInterface } from './moveActions';
import MainScene from '..';
import * as THREE from '../../node_modules/three/src/Three';
import { MathUtils } from '../../node_modules/three/src/Three';
import { Move } from './move';

class RubikManager {
  private rubikModel: RubikModel

  private rubikView: RubikView

  private rubikSolver: RubikSolver;

  private renderOrder: Map<string, number> = new Map();

  private scene: MainScene

  private historyDiv: HTMLDivElement

  private movementDiv: HTMLDivElement

  private historyButtons: HTMLButtonElement[]

  private historyButtonPrevActive: HTMLButtonElement

  private historyButtonActiveColor: string = '#868588'

  private historyButtonNotActiveColor: string = '#4CAF50';

  public constructor(scene: MainScene) {
    const sizeUp = document.getElementById('sizeUp') as HTMLButtonElement;
    sizeUp.onclick = () => this.sizeUp();

    const sizeDown = document.getElementById('sizeDown') as HTMLButtonElement;
    sizeDown.onclick = () => this.sizeDown();

    const scramble = document.getElementById('scramble') as HTMLButtonElement;
    scramble.onclick = () => this.scramble();

    const solve = document.getElementById('solve') as HTMLButtonElement;
    solve.onclick = () => this.solve();

    const prev = document.getElementById('prev') as HTMLButtonElement;
    prev.onclick = () => this.prev();

    const next = document.getElementById('next') as HTMLButtonElement;
    next.onclick = () => this.next();

    this.historyDiv = document.getElementById('buttonHistory') as HTMLDivElement;
    this.movementDiv = document.getElementById('moves') as HTMLDivElement;
    const outerMeshesCheckbox = document.getElementById('outerMeshes') as HTMLInputElement;
    const numbersCheckbox = document.getElementById('numbers') as HTMLInputElement;

    outerMeshesCheckbox.onchange = (e: Event) => {
      if (outerMeshesCheckbox.checked) {
        this.rubikView.enableOuter();
      } else {
        this.rubikView.disableOuter();
      }
    };

    numbersCheckbox.onchange = (e: Event) => {
      if (numbersCheckbox.checked) {
        this.rubikView.enableText();
      } else {
        this.rubikView.disableText();
      }
    };


    this.scene = scene;
    this.renderOrder.set('rubik', 0);

    this.addRubik(3);
  }

  private drawNewRubik() {
    this.scene.renderObjects[0] = this.rubikView;
    this.scene.mouseObjects[0] = this.rubikView;
    this.rubikView.addToScene();

    this.rubikView.enableBase();
    // this.rubikView.createBaseMeshes();
    // this.rubikView.colorizeBaseRubik();
    // this.rubikView.placeTextOnRubik(null);
    this.rubikView.changeCamera();
  }

  private addRubik(length: number) {
    this.rubikModel = new RubikModel(length);
    this.rubikView = new RubikView(this.rubikModel, this.scene);
    this.rubikSolver = new RubikSolver(this.rubikModel);

    window.addEventListener('moveComplete', (e) => {
      console.log('event happened');
      this.clearHistoryButtons();
      this.refreshHistoryButtons();
    }, false);

    this.historyButtons = [];
    this.clearMoveButtons();
    this.clearHistoryButtons();

    this.createMovementButtons();

    this.drawNewRubik();
    this.createCubeRotationButtons();
  }

  public scramble = () => {
    this.rubikModel.removeHistoryByCurrentIndex();
    this.rubikModel.scramble(5);
    this.clearHistoryButtons();
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
    this.rubikView.disableAll();
    this.addRubik(this.rubikModel.sideLength + 1);
  }

  public sizeDown = () => {
    if (this.rubikModel.sideLength > 3) {
      this.rubikView.disableAll();
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
      button.innerHTML = `${sidesStr[move.side]}${move.clockwise ? '' : "'"}${move.slice === 0 ? '' : move.slice}`;
    }

    button.onclick = () => {
      this.rubikModel.jumpToHistoryIndex(index);
      this.rubikModel.resetSO();

      this.rubikView.resetCubePositions();
      this.rubikView.colorizeBase();
      this.rubikView.colorizeBaseForSO();
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

  private createCubeRotationButtons = () => {
    const cubeRotationsDiv = document.getElementById('cube-rotations') as HTMLButtonElement;
    cubeRotationsDiv.innerHTML = '';

    const slices = [];
    for (let i = 0; i < this.rubikModel.sideLength; i += 1) {
      slices.push(i);
    }
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('up', this.rubikModel.rotateOVer, false));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('down', this.rubikModel.rotateOVer, true));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('left', this.rubikModel.rotateOHor, false));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('right', this.rubikModel.rotateOHor, true));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('clockwise', this.rubikModel.rotateODep, false));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('counter', this.rubikModel.rotateODep, true));
  }

  private createCubeRotationButton = (name: string, rotation: Function, clockwise: boolean): HTMLButtonElement => {
    const button = document.createElement('button');
    button.innerHTML = name;

    button.onclick = () => {
      rotation(clockwise);
      this.rubikView.startNextMove();
    };
    return button;
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

  private createMovementButton = (slice: number, clockwise: boolean, side: number): HTMLButtonElement => {
    const button = document.createElement('button');
    button.innerHTML = `${sidesStr[side]}${clockwise ? '' : "'"}${slice === 0 ? '' : slice + 1}`;

    button.onclick = () => {
      // this.moveOrientation[sideNum](slice, clockwise);
      // this.rubikModel.addMove(this.moveOrientation[sideNum], slice, clockwise);
      this.rubikModel.addMove(side, slice, clockwise);

      this.clearHistoryButtons();
      this.refreshHistoryButtons();
      this.rubikView.startNextMove();
    };
    return button;
  }
}

export default RubikManager;
