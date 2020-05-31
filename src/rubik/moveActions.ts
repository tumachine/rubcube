/* eslint-disable max-len */
import { Side } from './utils';

export class MoveActions {
  private operation;

  public constructor(operation: MoveOperation) {
    this.operation = operation;
  }

  public static createCustom(L: MoveInterface, R: MoveInterface, U: MoveInterface, D: MoveInterface, F: MoveInterface, B: MoveInterface): MoveActions {
    const customMoveActions = new MoveActions(null);
    customMoveActions.L = L;
    customMoveActions.R = R;
    customMoveActions.U = U;
    customMoveActions.D = D;
    customMoveActions.F = F;
    customMoveActions.B = B;
    return customMoveActions;
  }

  public L: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.l, slice, clockwise);

  public R: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.r, slice, clockwise);

  public U: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.u, slice, clockwise);

  public D: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.d, slice, clockwise);

  public F: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.f, slice, clockwise);

  public B: MoveInterface = (slice = 0, clockwise = true) => this.operation(Side.b, slice, clockwise);
}

interface MoveOperation {
  (side?: number, slice?: number, clockwise?: boolean): void
}

export interface MoveInterface {
  <T>(slice?: number, clockwise?: boolean, matrix?: T[][]): void
}

export default MoveActions;
