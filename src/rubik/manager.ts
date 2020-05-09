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

  // private moveOrientation: Move[]

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

    this.addRubik(3);

    // this.createOrientationButtons();
  }

  private drawNewRubik() {
    this.scene.renderObjects[0] = this.rubikView;
    this.scene.mouseObjects[0] = this.rubikView;
    this.rubikView.addToScene();

    this.rubikView.createMeshes();
    this.rubikView.colorizeRubik();
    // this.rubikView.placeTextOnRubik(null);
    // this.scene.controls.changeCamera(this.rubikModel.sideLength);
    this.rubikView.changeCamera();
  }

  private addRubik(length: number) {
    this.rubikModel = new RubikModel(length);
    this.rubikView = new RubikView(this.rubikModel, this.scene);
    this.rubikSolver = new RubikSolver(this.rubikModel);

    window.addEventListener('moveComplete', (e) => {
      console.log('event happened');
      this.rubikModel.removeHistoryByCurrentIndex();
      this.clearHistoryButtons();
      this.refreshHistoryButtons();
    }, false);

    this.moveRotation = 0;
    // this.moveOrientation = this.rubikModel.moveRotations[s.f][this.moveRotation];
    this.historyButtons = [];
    this.clearMoveButtons();
    this.clearHistoryButtons();

    this.createMovementButtons();

    this.drawNewRubik();
    this.createCubeRotationButtons();
  }

  public scramble = () => {
    this.rubikModel.scramble(10);
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
    this.rubikView.dispose();
    this.addRubik(this.rubikModel.sideLength + 1);
  }

  public sizeDown = () => {
    if (this.rubikModel.sideLength > 3) {
      this.rubikView.dispose();
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

  // private rotateVer = (clockwise: boolean) => {
  //   const mat = this.rubikModel.rotateOVer(clockwise);
  //   this.moveOrientation = this.rubikModel.moveOrientation;
  //   this.rubikView.colorizeRubik(mat);
  // }

  // private rotateHor = (clockwise: boolean) => {
  //   const mat = this.rubikModel.rotateOHor(clockwise);
  //   this.moveOrientation = this.rubikModel.moveOrientation;
  //   this.rubikView.colorizeRubik(mat);
  // }

  // private rotateDep = (clockwise: boolean) => {
  //   const mat = this.rubikModel.rotateODep(clockwise);
  //   this.moveOrientation = this.rubikModel.moveOrientation;
  //   this.rubikView.colorizeRubik(mat);
  // }

  // change orientation
  // with that change, update move
  // total possible orientations 6 sides * 4 rotations = 24
  // private createOrientationButtons = () => {
  //   for (let i = 0; i < sidesArr.length; i += 1) {
  //     const button = document.createElement('button');
  //     button.innerHTML = sidesStr[i];
  //     button.onclick = () => {
  //       this.changeOrientation(i);
  //       console.log('clicked orientation');
  //       console.log(this.rubikView.rubik.rotation);
  //     };
  //     this.orientationDiv.appendChild(button);
  //   }
  // }

  // private changeOrientation = (side: number) => {
  //   this.currentMoveRotations = this.rubikModel.moveRotations[side];
  //   this.moveOrientation = this.currentMoveRotations[this.moveRotation];
  // }

  // public rotateCurrentOrientation = (clockwise: boolean = true) => {
  //   if (clockwise) {
  //     this.moveRotation = (this.moveRotation + 1) % 4;
  //   } else {
  //     this.moveRotation = (Math.abs(this.moveRotation - 1)) % 4;
  //   }
  //   this.moveOrientation = this.currentMoveRotations[this.moveRotation];
  // }
}

export default RubikManager;
