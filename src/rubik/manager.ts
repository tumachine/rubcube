/* eslint-disable radix */
import RubikSolver from './solver';
import RubikModel from './model';
import RubikView from './view';
import { Side as s, createCamera, sides } from './utils';
import { MoveInterface } from './moveActions';
import MainScene from '..';
import * as THREE from '../../node_modules/three/src/Three';
import { MathUtils } from '../../node_modules/three/src/Three';
import { Move, CurrentMoveHistory } from './move';

class RubikManager {
  private rubikModel: RubikModel

  private rubikView: RubikView

  private renderOrder: Map<string, number> = new Map();

  private scene: MainScene

  private historyDiv: HTMLDivElement

  private movementDiv: HTMLDivElement

  private historyButtons: HTMLButtonElement[]

  private historyButtonPrevActive: HTMLButtonElement

  private historyButtonActiveColor: string = '#868588'

  private historyButtonNotActiveColor: string = '#4CAF50';

  private outerMeshesCheckbox: HTMLInputElement;

  private numbersCheckbox: HTMLInputElement;

  private currentMoveIndexText: HTMLParagraphElement

  private currentRubikSizeText: HTMLParagraphElement

  private fromIndexInput: HTMLInputElement

  private toIndexInput: HTMLInputElement

  private fromToAnimateButton: HTMLButtonElement

  private stopAnimationButton: HTMLButtonElement

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
    this.outerMeshesCheckbox = document.getElementById('outerMeshes') as HTMLInputElement;
    this.numbersCheckbox = document.getElementById('numbers') as HTMLInputElement;
    this.currentMoveIndexText = document.getElementById('current-move') as HTMLParagraphElement;
    this.currentRubikSizeText = document.getElementById('current-size') as HTMLParagraphElement;
    this.fromIndexInput = document.getElementById('from-index') as HTMLInputElement;
    this.toIndexInput = document.getElementById('to-index') as HTMLInputElement;
    this.fromToAnimateButton = document.getElementById('from-to-animate') as HTMLButtonElement;
    this.stopAnimationButton = document.getElementById('stop-animation') as HTMLButtonElement;

    this.stopAnimationButton.onclick = (e: Event) => {
      if (this.rubikModel.currentMoves.length > 0 || this.rubikView.isMoving) {
        const currentMove = this.rubikView.curMoveH;
        this.rubikModel.currentHistoryIndex = currentMove.index;
        this.rubikModel.clearCurrentMoves();
      }
    };

    this.fromIndexInput.oninput = (e: Event) => {
      const from = parseInt(this.fromIndexInput.value);
      if (from >= 0 && from < this.historyButtons.length) {
        // this.reset(from);
        this.jump(from);
      }
    };

    this.fromToAnimateButton.onclick = () => {
      const from = parseInt(this.fromIndexInput.value);
      const to = parseInt(this.toIndexInput.value);

      this.jump(from);

      this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
      this.switchButtonBackgroundColor(this.historyButtons[from], true);
      this.historyButtonPrevActive = this.historyButtons[from];

      this.rubikModel.fillCurrentMoves(from, to);
      this.rubikModel.currentHistoryIndex = to;
      this.rubikView.startNextMove();
    };

    this.outerMeshesCheckbox.onchange = (e: Event) => {
      if (this.outerMeshesCheckbox.checked) {
        // this.jump(this.rubikModel.currentHistoryIndex);
        // this.reset(this.rubikModel.currentHistoryIndex);
        this.rubikView.enableOuter();
      } else {
        this.rubikView.disposeOuter();
      }
    };

    this.numbersCheckbox.onchange = (e: Event) => {
      if (this.numbersCheckbox.checked) {
        // this.reset(this.rubikModel.currentHistoryIndex);
        this.rubikView.enableText();
      } else {
        this.rubikView.disposeText();
      }
    };

    this.scene = scene;
    this.renderOrder.set('rubik', 0);

    this.addRubik(3);
  }

  private drawNewRubik() {
    this.scene.renderObjects[0] = this.rubikView;
    this.rubikView.addToScene();

    this.rubikView.enableBase();
    this.rubikView.changeCamera();
    console.log(this.scene.renderer.info.memory);
  }

  private updateToIndex = () => {
    this.toIndexInput.value = (this.rubikModel.moveHistory.length - 1).toString();
  }

  private updateFromIndex = () => {
    this.fromIndexInput.value = this.rubikModel.currentHistoryIndex.toString();
  }

  private updateMoveIndexText = () => {
    this.currentMoveIndexText.innerHTML = this.rubikModel.currentHistoryIndex.toString();
  }


  private addNewMoveUpdate = () => {
    this.updateToIndex();
    this.refreshHistoryButtons();
  }

  private addRubik(length: number) {
    this.rubikModel = new RubikModel(length);
    this.rubikView = new RubikView(this.rubikModel, this.scene);
    this.updateMoveIndexText();
    this.currentRubikSizeText.innerHTML = this.rubikModel.sideLength.toString();
    this.updateFromIndex();
    this.updateToIndex();

    this.historyButtons = [];
    this.clearMoveButtons();
    this.refreshHistoryButtons();

    this.createMovementButtons();

    this.drawNewRubik();
    this.createCubeRotationButtons();

    this.rubikView.mouseMoveCompleteHandler = () => {
      // console.log('mousemovecomplete: event happened');
      this.updateMoveIndexText();
      this.updateFromIndex();

      this.addNewMoveUpdate();
    };

    this.rubikView.moveCompleteHandler = (move: CurrentMoveHistory) => {
      // console.log('movecomplete: event happened');
      this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
      this.switchButtonBackgroundColor(this.historyButtons[move.index], true);
      this.historyButtonPrevActive = this.historyButtons[move.index];

      this.fromIndexInput.value = move.index.toString();
      this.currentMoveIndexText.innerHTML = move.index.toString();
    };
  }

  public scramble = () => {
    this.rubikModel.scramble(5);
    this.addNewMoveUpdate();
    this.rubikView.startNextMove();
  }

  public solve = () => {
    this.rubikModel.solve();
    this.addNewMoveUpdate();
    this.rubikView.startNextMove();
  }

  public sizeUp = () => {
    this.rubikView.disposeAll();
    this.addRubik(this.rubikModel.sideLength + 1);
  }

  public sizeDown = () => {
    if (this.rubikModel.sideLength > 3) {
      this.rubikView.disposeAll();
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

  private refreshHistoryButtons = () => {
    this.clearHistoryButtons();
    this.addAllHistoryButtons();
    this.historyButtonPrevActive = this.historyButtons[this.rubikModel.currentHistoryIndex];
    this.switchButtonBackgroundColor(this.historyButtonPrevActive, true);
    for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
      this.historyDiv.appendChild(this.historyButtons[i]);
    }
  }

  private addAllHistoryButtons = () => {
    for (let i = 0; i < this.rubikModel.moveHistory.length; i += 1) {
      this.addHistoryButton(i);
    }
  }

  private clearHistoryButtons = () => {
    this.historyDiv.innerHTML = '';
    this.historyButtons = [];
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
      button.innerHTML = `${s.toString(move.side)}${move.clockwise ? '' : "'"}${move.slice === 0 ? '' : move.slice}`;
    }

    button.onclick = () => {
      // this.reset(index);
      this.jump(index);
      if (this.outerMeshesCheckbox.checked) {
        this.rubikView.colorizeOuter();
      }
      // this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
      // this.switchButtonBackgroundColor(button, true);
      // this.historyButtonPrevActive = button;
    };
    this.historyButtons.push(button);
  }

  private jump = (historyIndex: number) => {
    this.rubikView.jumpToHistoryIndex(historyIndex);
    this.updateFromIndex();
    this.updateMoveIndexText();

    this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
    this.switchButtonBackgroundColor(this.historyButtons[historyIndex], true);
    this.historyButtonPrevActive = this.historyButtons[historyIndex];
  }


  private reset = (historyIndex: number) => {
    this.rubikModel.jumpToHistoryIndex(historyIndex);
    this.updateFromIndex();
    this.updateMoveIndexText();

    this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
    this.switchButtonBackgroundColor(this.historyButtons[historyIndex], true);
    this.historyButtonPrevActive = this.historyButtons[historyIndex];

    this.rubikModel.resetSO();
    this.rubikView.resetCubePositions();
    this.rubikView.colorizeBase();
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
    // every side
    for (let i = 0; i < 6; i += 1) {
      for (let b = 0; b < 2; b += 1) {
        // every slice
        for (let j = 0; j < this.rubikModel.sideLength / 2; j += 1) {
          if (b === 0) {
            this.addButton(i, j, true);
          } else {
            this.addButton(i, j, false);
          }
        }
      }
    }
  }

  private addButton = (side: number, slice: number, clockwise: boolean) => {
    const button = document.createElement('button');
    button.innerHTML = `${s.toString(side)}${clockwise ? '' : "'"}${slice === 0 ? '' : slice + 1}`;

    button.onclick = () => {
      this.rubikModel.doUserMove(side, slice, clockwise);
      this.addNewMoveUpdate();
      this.rubikView.startNextMove();
    };

    this.movementDiv.appendChild(button);
  }
}

export default RubikManager;
