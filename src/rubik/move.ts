import { MoveHistory } from './utils';

export class Move {
  public rotation: RotateInterface

  public cubeGetter: CubeGetter

  public side: string

  public axis: 'x' | 'y' | 'z';

  public length: number

  public original: boolean

  public constructor(side: string, axis: 'x' | 'y' | 'z', rotation: RotateInterface, cubeGetter: CubeGetter, length: number, original: boolean) {
    this.rotation = rotation;
    this.cubeGetter = cubeGetter;
    this.side = side;
    this.axis = axis;
    this.length = length;
    this.original = original;
  }

  public getSliceOriginal = (slice: number | number[]): number | number[] => slice;

  public getSliceOpposite = (slice: number | number[]): number | number[] => {
    if (Array.isArray(slice)) {
      const slices = [];
      console.log(slice);
      for (let i = 0; i < slice.length; i += 1) {
        slices.push(this.length - 1 - slice[i]);
      }
      return slices;
    }
    return this.length - 1 - slice;
  }

  public getClockwiseOriginal = (clockwise: boolean) => clockwise;

  public getClockwiseOpposite = (clockwise: boolean) => !clockwise;

  public rotate<T>(slice: number | number[], clockwise: boolean, matrix: T[][]) {
    if (Array.isArray(slice)) {
      for (let i = 0; i < slice.length; i += 1) {
        this.rotation(slice[i], clockwise, matrix);
      }
    } else {
      this.rotation(slice, clockwise, matrix);
    }
  }

  public getCubes(slice: number | number[]): CubeDir[] {
    if (Array.isArray(slice)) {
      const cubes: CubeDir[] = [];
      for (let i = 0; i < slice.length; i += 1) {
        this.cubeGetter(slice[i]).forEach((cube) => cubes.push(cube));
      }
      return cubes;
    }
    return this.cubeGetter(slice);
  }
}

export class MoveOperation {
  public move: Move

  public slice: number | number[]

  public clockwise: boolean

  public axis: 'x' | 'y' | 'z';

  public side: string

  public constructor(move: Move, slice: number | number[], clockwise: boolean) {
    this.move = move;
    this.slice = this.move.original ? this.move.getSliceOriginal(slice) : this.move.getSliceOpposite(slice);
    this.clockwise = this.move.original ? this.move.getClockwiseOpposite(clockwise) : this.move.getClockwiseOriginal(clockwise);
    this.axis = this.move.axis;
    this.side = this.move.side;
  }

  public rotate<T>(matrix: T[][]) {
    this.move.rotate(this.slice, this.clockwise, matrix);
  }

  public getCubes(): CubeDir[] {
    return this.move.getCubes(this.slice);
  }
}

type CubeGetter = (slice: number) => CubeDir[];
type RotateInterface = <T, >(slice: number, clockwise: boolean, matrix: T[][]) => void;


export class CurrentMoveHistory {
  move: MoveHistory

  getMove: Function

  onComplete: Function

  index: number

  // public constructor(move: MoveHistory, index: number, rotateCube: boolean = false) {
  public constructor(move: MoveHistory, index: number, getMove: Function, onComplete: Function) {
    this.move = move;
    this.getMove = getMove;
    this.onComplete = onComplete;
    this.index = index;
  }
}


export interface CubeDir {
  side: number,
  direction: number,
}
