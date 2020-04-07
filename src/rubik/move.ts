/* eslint-disable max-len */
class Move {
  public side: string

  public axis: string

  public slice: number

  public clockwise: boolean

  public rotation: RotateInterface

  public cubeGetter: CubeGetter

  public constructor(side: string, slice: number, clockwise: boolean, axis: string, rotation: RotateInterface, cubeGetter: CubeGetter) {
    this.side = side;
    this.slice = slice;
    this.clockwise = clockwise;
    this.axis = axis;
    this.rotation = rotation;
    this.cubeGetter = cubeGetter;
  }

  public rotate(realMatrix: boolean) {
    this.rotation(this.slice, this.clockwise, realMatrix);
  }

  public getCubes(): number[] {
    return this.cubeGetter(this.slice);
  }
}

type CubeGetter = (slice: number) => number[];
type RotateInterface = (slice: number, clockwise: boolean, realMatrix: boolean) => void;

export default Move;
