/* eslint-disable max-len */
import { sides } from './utils';

export class MoveActions {
  private operation;

  public constructor(operation: MoveOperation) {
    this.operation = operation;
  }

  public L: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.l, slice, clockwise);

  public R: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.r, slice, clockwise);

  public U: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.u, slice, clockwise);

  public D: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.d, slice, clockwise);

  public F: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.f, slice, clockwise);

  public B: MoveInterface = (slice = 0, clockwise = true) => this.operation(sides.b, slice, clockwise);
}

interface MoveOperation {
  (side?: number, slice?: number, clockwise?: boolean): void
}

export interface MoveInterface {
  (slice?: number, clockwise?: boolean): void
}

export default MoveActions;
