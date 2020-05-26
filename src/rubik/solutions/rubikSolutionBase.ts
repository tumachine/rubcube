/* eslint-disable max-len */
import { Side } from '../utils';
import RubikOperations from '../operations';
import Face from '../face';
import MoveActions from '../moveActions';
import { OperationAfterFound, HighestPos } from './d';
import RubikModel from '../model';

interface LocalSides {
  l: number,
  r: number,
  f: number,
  b: number,
  u: number,
  d: number,
}

class RubikSolutionBase {
    public interface: number[][]

    public sideLength: number

    public primaryColor: number

    public middle: number

    public lineLength: number

    public ls: LocalSides

    public m: MoveActions

    public r: RubikModel

    // public constructor(rubik: RubikOperations) {
    public constructor(rubikModel: RubikModel) {
      this.r = rubikModel;

      this.sideLength = this.r.sideLength;

      this.middle = Math.floor(this.sideLength / 2);

      this.lineLength = this.sideLength - 1;

      this.interface = new Array(6);
    }

    public setLocalSidesAndMoves = (l: number, r: number, u: number, d: number, f: number, b: number) => {
      this.m = MoveActions.createCustom(
        this.r.m[Side.toString(l)],
        this.r.m[Side.toString(r)],
        this.r.m[Side.toString(u)],
        this.r.m[Side.toString(d)],
        this.r.m[Side.toString(f)],
        this.r.m[Side.toString(b)],
      );

      this.ls = {
        l, r, u, d, f, b,
      };
    }

    public check = (side: number, face: number, color: number): boolean => this.r.getColorFromInterface(side, face, this.interface) === color;

    public getColorHash = (side: number, direction: number): number => Side.getHash(this.r.getColorFromInterface(side, direction, this.interface));

    public getHash = (face: number): number => Side.getHash(face);

    public getFaceDirection = (row, col) => col + row * this.sideLength;

    public getLineCubeColor = (line, num) => this.sideLength * (num + 1) + 1 + line;

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
