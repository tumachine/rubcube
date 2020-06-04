/* eslint-disable radix */
import RubikSolver from './solver';
import RubikView from './view';
import { Side as s, createCamera, sides } from './utils';
import { MoveInterface } from './moveActions';
import MainScene from '..';
import * as THREE from '../../node_modules/three/src/Three';
import { Move, CurrentMoveHistory } from './move';

class RubikManager {
  private rubikView: RubikView

  private scene: MainScene

  private historyDiv: HTMLDivElement

  private movementDiv: HTMLDivElement

  private historyButtons: HTMLButtonElement[]

  private historyButtonPrevActive: HTMLButtonElement

  private buttonColors = {
    active: '#868588',
    notActive: '#4CAF50',
  }

  private outerMeshesCheckbox: HTMLInputElement;

  private numbersCheckbox: HTMLInputElement;

  private imageCheckbox: HTMLInputElement;

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
    this.imageCheckbox = document.getElementById('images') as HTMLInputElement;
    this.currentMoveIndexText = document.getElementById('current-move') as HTMLParagraphElement;
    this.currentRubikSizeText = document.getElementById('current-size') as HTMLParagraphElement;
    this.fromIndexInput = document.getElementById('from-index') as HTMLInputElement;
    this.toIndexInput = document.getElementById('to-index') as HTMLInputElement;
    this.fromToAnimateButton = document.getElementById('from-to-animate') as HTMLButtonElement;
    this.stopAnimationButton = document.getElementById('stop-animation') as HTMLButtonElement;

    this.stopAnimationButton.onclick = (e: Event) => {
      this.rubikView.stopAnimation();
    };

    this.fromIndexInput.oninput = (e: Event) => {
      const from = parseInt(this.fromIndexInput.value);
      if (from >= 0 && from < this.historyButtons.length) {
        this.jump(from);
      }
    };

    this.fromToAnimateButton.onclick = () => {
      const to = parseInt(this.toIndexInput.value);

      this.rubikView.doMoves(to);
    };

    this.outerMeshesCheckbox.onchange = (e: Event) => {
      if (this.outerMeshesCheckbox.checked) {
        this.rubikView.enableOuter();
      } else {
        this.rubikView.disposeOuter();
      }
    };

    this.numbersCheckbox.onchange = (e: Event) => {
      if (this.numbersCheckbox.checked) {
        this.rubikView.drawText();
        this.imageCheckbox.checked = false;
      } else {
        this.rubikView.disposeImages();
      }
    };

    this.imageCheckbox.onchange = (e: Event) => {
      if (this.imageCheckbox.checked) {
        this.rubikView.drawImages();
        this.numbersCheckbox.checked = false;
      } else {
        this.rubikView.disposeImages();
      }
    };

    this.scene = scene;
    this.addRubik(3);
  }

  private updateToIndex = (historyIndex: number = this.rubikView.getHistory().length - 1) => {
    this.toIndexInput.value = (historyIndex).toString();
  }

  private updateFromIndex = (historyIndex: number = this.rubikView.getCurrentHistoryIndex()) => {
    this.fromIndexInput.value = historyIndex.toString();
  }

  private updateCurrentMoveText = () => {
    this.currentMoveIndexText.innerHTML = this.rubikView.getCurrentHistoryIndex().toString();
  }

  private addRubik(length: number) {
    this.rubikView = new RubikView(length, this.scene);
    this.currentRubikSizeText.innerHTML = this.rubikView.getLength().toString();

    this.updateCurrentMoveText();
    this.updateFromIndex();
    this.updateToIndex();

    this.clearMoveButtons();
    this.createMovementButtons();

    this.clearHistoryButtons();
    this.refreshHistoryButtons();

    this.createCubeRotationButtons();

    this.rubikView.moveCompleteHandler = (move: CurrentMoveHistory) => {
      // console.log('movecomplete: event happened');
      if (move.index !== -1) {
        this.updateActiveHistoryButton(move.index);

        this.fromIndexInput.value = move.index.toString();
        this.currentMoveIndexText.innerHTML = move.index.toString();
      }
    };

    this.rubikView.newMoveHandler = () => {
      this.updateToIndex();
      this.refreshHistoryButtons();
    };
  }

  public scramble = () => {
    this.rubikView.scramble(20);
  }

  public solve = () => {
    this.rubikView.solve();
  }

  public sizeUp = () => {
    this.rubikView.disposeAll();
    this.addRubik(this.rubikView.getLength() + 1);
  }

  public sizeDown = () => {
    if (this.rubikView.getLength() > 3) {
      this.rubikView.disposeAll();
      this.addRubik(this.rubikView.getLength() - 1);
    }
  }

  public prev = () => {
    this.rubikView.moveBack();
  }

  public next = () => {
    this.rubikView.moveForward();
  }

  private refreshHistoryButtons = () => {
    this.clearHistoryButtons();
    this.addAllHistoryButtons();
    this.historyButtonPrevActive = this.historyButtons[this.rubikView.getCurrentHistoryIndex()];
    this.switchButtonBackgroundColor(this.historyButtonPrevActive, true);
    for (let i = 0; i < this.rubikView.getHistory().length; i += 1) {
      this.historyDiv.appendChild(this.historyButtons[i]);
    }
  }

  private addAllHistoryButtons = () => {
    for (let i = 0; i < this.rubikView.getHistory().length; i += 1) {
      this.addHistoryButton(i);
    }
  }

  private clearHistoryButtons = () => {
    this.historyDiv.innerHTML = '';
    this.historyButtons = [];
  }

  private switchButtonBackgroundColor = (button: HTMLButtonElement, active: boolean) => {
    if (active) {
      button.style.backgroundColor = this.buttonColors.active;
    } else {
      button.style.backgroundColor = this.buttonColors.notActive;
    }
  }

  private addHistoryButton = (index: number) => {
    const button = document.createElement('button');

    const move = this.rubikView.getHistory()[index];
    if (move !== null) {
      button.innerHTML = `${index}: ${s.toString(move.side)}${move.clockwise ? '' : "'"}${move.slice === 0 ? '' : move.slice}`;
    }

    button.onclick = () => {
      this.jump(index);
      if (this.outerMeshesCheckbox.checked) {
        this.rubikView.colorizeOuter();
      }
    };
    this.historyButtons.push(button);
  }

  private jump = (historyIndex: number) => {
    this.rubikView.jump(historyIndex);
    this.updateActiveHistoryButton(historyIndex);
  }

  private updateActiveHistoryButton = (historyIndex: number) => {
    this.updateFromIndex();
    this.updateCurrentMoveText();

    this.switchButtonBackgroundColor(this.historyButtonPrevActive, false);
    this.switchButtonBackgroundColor(this.historyButtons[historyIndex], true);
    this.historyButtonPrevActive = this.historyButtons[historyIndex];
  }

  private createCubeRotationButtons = () => {
    const cubeRotationsDiv = document.getElementById('cube-rotations') as HTMLButtonElement;
    cubeRotationsDiv.innerHTML = '';

    cubeRotationsDiv.appendChild(this.createCubeRotationButton('up', this.rubikView.cubeRotationOperations.up));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('down', this.rubikView.cubeRotationOperations.down));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('left', this.rubikView.cubeRotationOperations.left));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('right', this.rubikView.cubeRotationOperations.right));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('clockwise', this.rubikView.cubeRotationOperations.clockwise));
    cubeRotationsDiv.appendChild(this.createCubeRotationButton('counter', this.rubikView.cubeRotationOperations.counter));
  }

  private createCubeRotationButton = (name: string, rotate: Function): HTMLButtonElement => {
    const button = document.createElement('button');
    button.innerHTML = name;

    button.onclick = () => {
      rotate();
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
        for (let j = 0; j < this.rubikView.getLength() / 2; j += 1) {
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
      this.rubikView.doMove(side, slice, clockwise);
    };

    this.movementDiv.appendChild(button);
  }
}

export default RubikManager;
