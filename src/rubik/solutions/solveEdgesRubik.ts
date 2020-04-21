/* eslint-disable max-len */
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';
import { OperationAfterFound, FindReturn } from './d';
import RubikSolutionBase from './rubikSolutionBase';

interface RotateFunc {
  (): void;
}

interface ParityInfo {
  edge: Edge,
  parities: number[],
}

interface Edge {
    side: number[][],
    firstFace: s,
    secondFace: s,
    rotateOpposite: RotateFunc,
    rotateCorrect: RotateFunc,
}

class SolveEdgesRubik extends RubikSolutionBase {
  private m: MoveActions;

  // local sides
  private ls;

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = new MoveActions();
    this.m.L = rubik.moves.L;
    this.m.R = rubik.moves.R;
    this.m.F = rubik.moves.F;
    this.m.B = rubik.moves.B;
    this.m.U = rubik.moves.U;
    this.m.D = rubik.moves.D;

    this.interface = new Array(6);
    this.interface[s.l] = [...this.rubik.stRotations[0]];
    this.interface[s.r] = [...this.rubik.opRotations[0]];
    this.interface[s.u] = [...this.rubik.opRotations[2]];
    this.interface[s.d] = [...this.rubik.stRotations[2]];
    this.interface[s.f] = [...this.rubik.stRotations[0]];
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    // create arrays which would represent edges of a face
    const down = [];
    const left = [];
    const right = [];
    const up = [];

    for (let i = 1; i < this.sideLength - 1; i += 1) {
      down.push(i);
    }

    for (let i = this.sideLength; i < this.sideLength * this.sideLength - this.sideLength; i += this.sideLength) {
      left.push(i);
    }

    for (let i = this.sideLength * 2 - 1; i < this.sideLength * this.sideLength - this.sideLength; i += this.sideLength) {
      right.push(i);
    }

    for (let i = this.sideLength * (this.sideLength - 1) + 1; i < this.sideLength * this.sideLength - 1; i += 1) {
      up.push(i);
    }
    const lineLength = this.sideLength - 2;
    // in out colors
    const leftRight = [];
    for (let i = 0; i < lineLength; i += 1) {
      leftRight.push([right[i], left[i]]);
    }
    // console.log('Left Right:');
    // console.log(leftRight);

    const upFront = [];
    const upRight = [];
    const upBack = [];
    const upLeft = [];
    const downFront = [];
    const downRight = [];
    const downBack = [];
    const downLeft = [];


    for (let i = 0; i < lineLength; i += 1) {
      upFront.push([up[lineLength - i - 1], down[lineLength - i - 1]]);
      upRight.push([up[lineLength - i - 1], right[lineLength - i - 1]]);
      upBack.push([up[lineLength - i - 1], up[i]]);
      upLeft.push([up[lineLength - i - 1], left[i]]);
      downFront.push([down[i], down[lineLength - i - 1]]);
      downRight.push([down[i], left[i]]);
      downBack.push([down[i], up[i]]);
      downLeft.push([down[i], right[lineLength - i - 1]]);
    }
    // console.log('Up Front:');
    // console.log(upFront);
    // console.log('Up Right:');
    // console.log(upRight);
    // console.log('Up Back:');
    // console.log(upBack);
    // console.log('Up Left:');
    // console.log(upLeft);
    // console.log('Down Front:');
    // console.log(downFront);
    // console.log('Down Right:');
    // console.log(downRight);
    // console.log('Down Back:');
    // console.log(downBack);
    // console.log('Down Left:');
    // console.log(downLeft);

    const UF: Edge = {
      side: upFront,
      firstFace: s.f,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U();
        this.m.L();
      },
      rotateCorrect: () => {
        // this.m.U(0, false);
        // this.m.R(0, false);
        this.m.F();
      },
    };

    const UR: Edge = {
      side: upRight,
      firstFace: s.r,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U();
        this.m.U();
        this.m.L();
      },
      rotateCorrect: () => {
        // this.m.R(0, false);

        this.m.U(0, false);
        this.m.B(0, false);
        this.m.R();
        this.m.R();
      },
    };


    const UB: Edge = {
      side: upBack,
      firstFace: s.b,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U(0, false);
        this.m.L();
      },
      rotateCorrect: () => {
        // this.m.U();
        // this.m.R(0, false);
        this.m.B(0, false);
        this.m.R();
        this.m.R();
      },
    };

    const UL: Edge = {
      side: upLeft,
      firstFace: s.l,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.L();
      },
      rotateCorrect: () => {
        // this.m.U();
        // this.m.U();
        // this.m.R(0, false);
        this.m.L(0, false);
        this.m.B(0, false);
        this.m.U();
        this.m.R(0, false);
      },
    };

    const DF: Edge = {
      side: downFront,
      firstFace: s.f,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D(0, false);
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        // this.m.D();
        // this.m.R();
        this.m.F(0, false);
      },
    };

    const DL: Edge = {
      side: downLeft,
      firstFace: s.l,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        // this.m.D();
        // this.m.D();
        // this.m.R();
        this.m.D(0, false);
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    const DB: Edge = {
      side: downBack,
      firstFace: s.b,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D();
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        // this.m.D(0, false);
        // this.m.R();
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    const DR: Edge = {
      side: downRight,
      firstFace: s.r,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D();
        this.m.D();
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        // this.m.R();
        this.m.D();
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    const FR: Edge = {
      side: leftRight,
      firstFace: s.f,
      secondFace: s.r,
      rotateOpposite: () => {
        // this.m.R();
        // this.m.U(0, false);
        // this.m.B();
        // this.m.L();
        // this.m.L();
        // do nothing
      },
      rotateCorrect: () => {
        // do nothing
      },
    };

    const RB: Edge = {
      side: leftRight,
      firstFace: s.r,
      secondFace: s.b,
      rotateOpposite: () => {
        this.m.B();
        this.m.B();
        this.m.L();
        this.m.L();
      },
      rotateCorrect: () => {
        // this.m.R();
        // this.m.R();
        this.m.B();
        this.m.U();
        this.m.R(0, false);
      },
    };

    const BL: Edge = {
      side: leftRight,
      firstFace: s.b,
      secondFace: s.l,
      rotateOpposite: () => {
        this.m.B(0, false);
        this.m.U(0, false);
        this.m.L();
      },
      rotateCorrect: () => {
        this.m.B();
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    const LF: Edge = {
      side: leftRight,
      firstFace: s.l,
      secondFace: s.f,
      rotateOpposite: () => {
        // do nothing
      },
      rotateCorrect: () => {
        // this.m.F();
        // this.m.F();
        this.m.L(0, false);
        this.m.U(0, false);
        this.m.F();
      },
    };

    // this.m.D(, false);

    // first solve first case

    // we want to find front-up edge
    const hash = this.getEdgeHash(UF);

    const middle = Math.floor(this.sideLength / 2 - 1);

    // removed front right
    const edges: Edge[] = [UF, UR, UB, UL, DF, DR, DB, DL, RB, BL, LF, FR];

    const correctEdges: boolean[] = [];
    for (let i = 0; i < this.sideLength - 2; i += 1) {
      correctEdges.push(false);
    }

    const resetCorrectEdges = () => {
      for (let i = 0; i < correctEdges.length; i += 1) {
        correctEdges[i] = false;
      }
    };

    const getNextIncorrectEdge = (): number => {
      for (let i = 0; i < correctEdges.length; i += 1) {
        if (correctEdges[i] === false) {
          return i;
        }
      }
      return -1;
    };

    const checkEdgeSides = (index: number, edgeOpposite: Edge = LF, edgeCorrect: Edge = FR): boolean => {
      const correctFirst = this.getColorHash(edgeCorrect.firstFace, edgeCorrect.side[middle][0]);
      const correctSecond = this.getColorHash(edgeCorrect.secondFace, edgeCorrect.side[middle][1]);
      const oppositeFirst = this.getColorHash(edgeOpposite.firstFace, edgeOpposite.side[index][0]);
      const oppositeSecond = this.getColorHash(edgeOpposite.secondFace, edgeOpposite.side[index][1]);
      return (correctFirst === oppositeFirst) && (correctSecond === oppositeSecond);
    };

    const solveEdgeIndex = (correctHash: number, index: number, e: Edge): boolean => {
      const oppositeIndex = Math.abs(this.sideLength - 3 - index);

      // console.log(index);
      // console.log(oppositeIndex);
      const hashOnIndex = this.getEdgeHashPosition(e, index);
      const hashOnOppositeIndex = this.getEdgeHashPosition(e, oppositeIndex);

      if (hashOnIndex === correctHash) {
        e.rotateOpposite();
        if (checkEdgeSides(index)) {
          this.moveOppToCorrect(index);
          correctEdges[index] = true;
        } else {
          this.flipWholeEdge();
          this.moveOppToCorrect(oppositeIndex);
          correctEdges[oppositeIndex] = true;
        }
        return true;
      }

      if (hashOnOppositeIndex === correctHash) {
        e.rotateOpposite();
        if (checkEdgeSides(oppositeIndex)) {
          this.moveOppToCorrect(oppositeIndex);
          correctEdges[oppositeIndex] = true;
        } else {
          this.flipWholeEdge();
          this.moveOppToCorrect(index);
          correctEdges[index] = true;
        }
        return true;
      }

      return false;
    };

    const solveMiddle = (correctHash: number) => {
      for (let edge = 0; edge < edges.length; edge += 1) {
        const hashOnMiddle = this.getEdgeHashPosition(edges[edge], middle);
        if (hashOnMiddle === correctHash) {
          edges[edge].rotateCorrect();
          break;
        }
      }
      correctEdges[middle] = true;
    };

    const solveEdge = (firstFace: number, secondFace: number) => {
      const correctHash = this.getEdgeHashFromFaces(firstFace, secondFace);
      resetCorrectEdges();
      solveMiddle(correctHash);
      for (let i = 0; i < (this.sideLength - 2) + (this.sideLength - 2); i += 1) {
        const nextEdge = getNextIncorrectEdge();
        if (nextEdge === -1) {
          break;
        }
        // console.log(nextEdge);
        const hashOnBaseIndex = this.getEdgeHashPosition(FR, nextEdge);
        if (correctHash === hashOnBaseIndex) {
          correctEdges[nextEdge] = true;
          // if (checkEdgeSides(nextEdge, FR)) {
          //   correctEdges[nextEdge] = true;
          // } else {
          //   this.moveOppToCorrect(nextEdge);
          // }
        } else {
          for (let edge = 0; edge < edges.length; edge += 1) {
            if (solveEdgeIndex(correctHash, nextEdge, edges[edge])) {
              // if (this.getEdgeHashPosition(FR, nextEdge) !== correctHash) {
              //   console.log('INCORRECT');
              // }
              console.log(`Solved: ${i}`);
              break;
            }
          }
        }
      }
    };

    const solveEdges = () => {
      for (let i = 0; i < edges.length; i += 1) {
        solveEdge(edges[i].firstFace, edges[i].secondFace);
      }
    };


    // solveEdge(s.f, s.l);
    solveEdges();

    // const parities: Edge[] = [];
    // const foundParitiesIndexes: number[][] = [];

    // const findParities = () => {
    //   for (let i = 0; i < edges.length; i += 1) {
    //     let found = false;
    //     const foundParities: number[] = [];
    //     for (let e = 0; e < this.sideLength - 2; e += 1) {
    //       if (!checkEdgeSides(e, edges[i], edges[i])) {
    //         found = true;
    //         foundParities.push(e);
    //       }
    //     }

    //     if (found) {
    //       parities.push(edges[i]);
    //       foundParitiesIndexes.push(foundParities);
    //     }
    //   }
    // };

    const getNextParity = (): ParityInfo => {
      const parityIndexes = [];
      for (let i = 0; i < edges.length; i += 1) {
        let found = false;
        for (let e = 0; e < this.sideLength - 2; e += 1) {
          if (!checkEdgeSides(e, edges[i], edges[i])) {
            found = true;
            parityIndexes.push(e);
          }
        }

        if (found) {
          return { edge: edges[i], parities: parityIndexes };
        }
      }
      return { edge: null, parities: null };
    };

    // findParities();
    // console.log(parities);
    // console.log(foundParitiesIndexes);

    const rotateFirstHalf = (parityIndexes: number[], move: MoveInterface, clockwise: boolean = true) => {
      for (let i = 0; i < parityIndexes.length / 2; i += 1) {
        console.log(parityIndexes[i] + 1);
        move(parityIndexes[i] + 1, clockwise);
      }
    };

    // const { edge, parities } = getNextParity();
    // if (edge !== null) {
    //   edge.rotateCorrect();
    //   this.m.F(0, false);
    // }

    const solveParities = () => {
      // move them front up
      for (let i = 0; i < 8; i += 1) {
        const { edge, parities } = getNextParity();
        if (edge === null) {
          break;
        }

        console.log(`Parity: ${i + 1}`);
        edge.rotateCorrect();
        this.m.F(0, false);
        // move other parities to left or right
        // all first half
        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);

        this.m.U();
        this.m.U();
        // all
        // this.m.L(index);
        rotateFirstHalf(parities, this.m.L);

        this.m.F();
        this.m.F();

        // this.m.L(index, false);
        rotateFirstHalf(parities, this.m.L, false);

        this.m.F();
        this.m.F();

        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);
        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);

        this.m.U();
        this.m.U();

        // this.m.R(index);
        rotateFirstHalf(parities, this.m.R);

        this.m.U();
        this.m.U();

        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);

        this.m.U();
        this.m.U();

        this.m.F();
        this.m.F();

        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);
        // this.m.R(index, false);
        rotateFirstHalf(parities, this.m.R, false);

        this.m.F();
        this.m.F();
      }
    };

    solveParities();
  }

  moveOppToCorrect = (index: number) => {
    const correctIndex = index + 1;
    this.m.L(0, false);
    this.m.L(0, false);
    this.m.D(correctIndex);
    this.m.D(correctIndex);
    this.m.L();
    this.m.B(0, false);
    this.m.U();
    this.m.L(0, false);
    this.m.B();
    this.m.D(correctIndex, false);
    this.m.D(correctIndex, false);
  }

  flipWholeEdge = () => {
    this.m.L(0, false);
    this.m.U();
    this.m.B();
    this.m.L();
    this.m.L();

    // this.m.R();
    // this.m.U();
    // this.m.R(0, false);
    // this.m.F();
    // this.m.R(0, false);
    // this.m.F(0, false);
    // this.m.R();
  }

  // moveOppToCorrectUpMid = (index: number) => {
  //   const correctIndex = index + 1;
  //   this.m.D(correctIndex);
  //   this.m.B(0, false);
  //   this.m.R(0, false);
  //   this.m.U();
  //   this.m.B();
  //   this.m.R();
  //   this.m.D(correctIndex, false);
  // }


  getEdgeHashFromFaces = (firstFace: number, secondFace: number) => colorHashes[firstFace] + colorHashes[secondFace];

  getEdgeHash = (e: Edge) => this.getEdgeHashFromFaces(e.firstFace, e.secondFace);

  getEdgeHashPosition = (e: Edge, index: number) => this.getColorHash(e.firstFace, e.side[index][0]) + this.getColorHash(e.secondFace, e.side[index][1]);

  checkEdge = (index: number, hash: number, e: Edge): boolean => {
    const edgeHash = this.getColorHash(e.firstFace, e.side[index][0]) + this.getColorHash(e.secondFace, e.side[index][1]);
    if (edgeHash === hash) {
      return true;
    }
    return false;
  }
}

export default SolveEdgesRubik;
