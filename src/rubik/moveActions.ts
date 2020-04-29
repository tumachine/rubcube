export class MoveActions {
    L: MoveInterface

    R: MoveInterface

    U: MoveInterface

    D: MoveInterface

    F: MoveInterface

    B: MoveInterface
}

export interface MoveInterface {
  (slice?: number, clockwise?: boolean): void
}

export default MoveActions;
