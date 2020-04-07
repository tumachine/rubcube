class MoveActions {
    L: MoveInterface

    R: MoveInterface

    U: MoveInterface

    D: MoveInterface

    F: MoveInterface

    B: MoveInterface
}

interface MoveInterface {
  (slice?: number, clockwise?: boolean): void
}

type MoveIndex = { [side: string]: MoveActions };

export default MoveActions;
