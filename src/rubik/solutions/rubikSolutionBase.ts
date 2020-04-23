/* eslint-disable max-len */
import { colorHashes, sides } from '../utils';
import RubikModel from '../model';
import Face from '../face';
import MoveActions from '../moveActions';
import { OperationAfterFound, HighestPos } from './d';

interface LocalSides {
  l: number,
  r: number,
  f: number,
  b: number,
  u: number,
  d: number,
}

class RubikSolutionBase {
    public rubik: RubikModel;

    public interface: number[][];

    public f: Face;

    public sideLength: number;

    // side
    public primaryColor: number;

    public middle: number;

    public lineLength;

    public ls: LocalSides;

    public m: MoveActions;

    public constructor(rubik: RubikModel) {
      this.rubik = rubik;

      this.f = rubik.f;

      this.sideLength = rubik.sideLength;

      this.middle = Math.floor(this.sideLength / 2);

      this.lineLength = this.sideLength - 1;

      this.m = new MoveActions();

      this.interface = new Array(6);
    }

    public check = (side: number, face: number, color: number): boolean => this.getColor(side, face) === color;

    public getColor = (side: number, direction: number): number => this.rubik.matrix[side][this.interface[side][direction]];

    public getColorHash = (side: number, direction: number): number => colorHashes[this.getColor(side, direction)];

    public getHash = (face: number): number => colorHashes[face];

    public getFaceDirection = (row, col) => col + row * this.rubik.sideLength;

    public getLineCubeColor = (line, num) => this.rubik.sideLength * (num + 1) + 1 + line;

    public findHighestPos = (row: number, column: number, side: number): HighestPos => {
      let nextPos = this.getFaceDirection(row, column);
      let highestPos = nextPos;
      let found = false;
      for (let i = 0; i < 4; i += 1) {
        // highest column is a row
        const currentRow = Math.floor(nextPos / this.sideLength);
        const currentCol = nextPos % this.sideLength;
        highestPos = nextPos > highestPos ? nextPos : highestPos;
        if (this.check(side, nextPos, this.primaryColor)) {
          // place it on a row where column is at
          found = true;
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }
      return { highestPos, found };
    }

    // finds cube and gives amount of rotations
    public baseFind = (row: number, column: number, side: number, operation: OperationAfterFound): boolean => {
      let nextPos = this.getFaceDirection(row, column);
      const origPos = nextPos;
      for (let i = 0; i < 4; i += 1) {
        const currentRow = Math.floor(nextPos / this.sideLength);
        const currentCol = nextPos % this.sideLength;
        if (this.check(side, nextPos, this.primaryColor)) {
          const result = operation({
            nextPos,
            origPos,
            column,
            row,
            currentCol,
            currentRow,
            rotations: i,
          });
          if (result === true) {
            return true;
          }
        }
        nextPos = currentRow + (this.sideLength - 1 - currentCol) * this.sideLength;
      }
      return false;
    }
}

export default RubikSolutionBase;
