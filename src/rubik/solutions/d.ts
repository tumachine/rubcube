export interface FindReturn {
  nextPos: number,
  origPos: number,
  column: number,
  row: number,
  currentCol: number,
  currentRow: number,
  rotations: number,
}

export interface OperationAfterFound {
  (info: FindReturn): boolean,
}

export interface HighestPos {
    highestPos: number,
    found: boolean,
}
