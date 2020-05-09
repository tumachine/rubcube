/* eslint-disable max-classes-per-file */
/* eslint-disable max-len */

export class Move {
  public rotation: RotateInterface

  public cubeGetter: CubeGetter

  public side: string

  public axis: string

  public length: number

  public original: boolean

  public constructor(side: string, axis: string, rotation: RotateInterface, cubeGetter: CubeGetter, length: number, original: boolean) {
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

  public rotate(slice: number | number[], clockwise: boolean, realMatrix: boolean) {
    if (Array.isArray(slice)) {
      for (let i = 0; i < slice.length; i += 1) {
        this.rotation(slice[i], clockwise, realMatrix);
      }
    } else {
      this.rotation(slice, clockwise, realMatrix);
    }
  }

  public getCubes(slice: number | number[]): number[] {
    if (Array.isArray(slice)) {
      const cubes = [];
      for (let i = 0; i < slice.length; i += 1) {
        this.cubeGetter(slice[i]).forEach((cube) => cubes.push(cube));
      }
      return cubes;
    }
    return this.cubeGetter(slice);
  }

  // public rotate(slice: number | number[], clockwise: boolean, realMatrix: boolean) {
  //   const clock = this.getClockwise(clockwise);
  //   if (Array.isArray(slice)) {
  //     for (let i = 0; i < slice.length; i += 1) {
  //       const sliceN = this.getSlice(slice[i]);
  //       this.rotation(sliceN, clock, realMatrix);
  //     }
  //   } else {
  //     const sliceN = this.getSlice(slice);
  //     this.rotation(sliceN, clock, realMatrix);
  //   }
  // }

  // public getCubes(slice: number | number[]): number[] {
  //   if (Array.isArray(slice)) {
  //     const cubes = [];
  //     for (let i = 0; i < slice.length; i += 1) {
  //       const sliceN = this.getSlice(slice[i]);
  //       cubes.push(this.cubeGetter[sliceN]);
  //     }
  //     return cubes;
  //   }
  //   const sliceN = this.getSlice(slice);
  //   return this.cubeGetter(sliceN);
  // }
}

export class MoveOperation {
  public move: Move

  public slice: number | number[]

  public clockwise: boolean

  public axis: string

  public side: string

  public constructor(move: Move, slice: number | number[], clockwise: boolean) {
    this.move = move;
    this.slice = this.move.original ? this.move.getSliceOriginal(slice) : this.move.getSliceOpposite(slice);
    this.clockwise = this.move.original ? this.move.getClockwiseOpposite(clockwise) : this.move.getClockwiseOriginal(clockwise);
    this.axis = this.move.axis;
    this.side = this.move.side;
  }

  public getOpposite(): MoveOperation {
    const move = new MoveOperation(this.move, this.slice, !this.clockwise);
    move.slice = this.slice;
    move.clockwise = !this.clockwise;
    return move;
  }

  public rotate(realMatrix: boolean) {
    this.move.rotate(this.slice, this.clockwise, realMatrix);
  }

  public getCubes(): number[] {
    return this.move.getCubes(this.slice);
  }
}

type CubeGetter = (slice: number) => number[];
type RotateInterface = (slice: number, clockwise: boolean, realMatrix: boolean) => void;
