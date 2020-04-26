/* eslint-disable max-len */
type Matrix = Array<Array<number>>;

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

  static getOpposite(m: Move): Move {
    return new Move(m.side, m.slice, !m.clockwise, m.axis, m.rotation, m.cubeGetter);
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
