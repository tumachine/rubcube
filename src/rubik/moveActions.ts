import RubikOperations from './operations';
import Move from './move';

class MoveActions {
    L: MoveInterface

    R: MoveInterface

    U: MoveInterface

    D: MoveInterface

    F: MoveInterface

    B: MoveInterface
}

//     register = (m: Move) => {
//       this.history.push(m);
//       // should separate rotations
//       // m.rotate(true);
//     }

//     public generateRandomMoves = (num: number, randomSlices = false) => {
//       function randomInt(min: number, max: number) {
//         return Math.floor(Math.random() * (max - min + 1) + min);
//       }

//       const moves = [
//         this.D,
//         this.U,
//         this.F,
//         this.B,
//         this.L,
//         this.R,
//       ];

//       if (randomSlices === true) {
//         for (let i = 0; i < num; i += 1) {
//           const clockwise = randomInt(0, 1) === 0;
//           // random moves should not move center slices
//           const slice = randomInt(0, Math.floor(this.sideLength / 2) - 1);
//           moves[randomInt(0, moves.length - 1)](slice, clockwise);
//         }
//       } else {
//         for (let i = 0; i < num; i += 1) {
//           const clockwise = randomInt(0, 1) === 0;
//           moves[randomInt(0, moves.length - 1)](0, clockwise);
//         }
//       }
//       console.log('Generated random moves');
//       // console.log(this.moveHistory);
//     }
// }

interface MoveInterface {
  (slice?: number, clockwise?: boolean): void
}

export default MoveActions;
