import { colorHashes } from '../utils';
import RubikModel from '../model';
import Face from '../face';
import MoveActions from '../moveActions';

interface RubikSolutionBaseInterface {
  solve(): void;
}

class RubikSolutionBase {
    public rubik: RubikModel;

    public interface: number[][];

    public f: Face;

    public sideLength: number;

    public constructor(rubik: RubikModel) {
      this.rubik = rubik;
      this.f = rubik.f;
      this.sideLength = rubik.sideLength;
    }

    public check = (side: number, face: number, color: number): boolean => this.getColor(side, face) === color;

    public getColor = (side: number, direction: number): number => this.rubik.matrix[side][this.interface[side][direction]];

    public getColorHash = (side: number, direction: number): number => colorHashes[this.getColor(side, direction)];

    public getFaceDirection = (row, col) => col + row * this.rubik.sideLength;

    public getLineCubeColor = (line, num) => this.rubik.sideLength * (num + 1) + 1 + line;
}

export default RubikSolutionBase;
