/* eslint-disable max-len */
import RubikOperations from '../operations';
import { Side as s, Side } from '../utils';
import { FindReturn } from './d';
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikState from '../state';
import RubikStructures from '../structures';
import RubikModel from '../model';

interface RotateFunc {
  (): void;
}

interface ParityInfo {
  edge: Edge,
  parities: number[],
}

interface Edge {
    side: number[][],
    firstFace: number,
    secondFace: number,
    rotateOpposite: RotateFunc,
    rotateCorrect: RotateFunc,
}

class SolveEdgesRubik extends RubikSolutionBase {
  public UF: Edge;

  public UR: Edge;

  public UB: Edge;

  public UL: Edge;

  public DF: Edge;

  public DR: Edge;

  public DB: Edge;

  public DL: Edge;

  public RB: Edge;

  public BL: Edge;

  public LF: Edge;

  public FR: Edge;

  public edges: Edge[];

  public correctEdges: boolean[] = [];

  public currentMiddle: number;

  public secondMiddle: number;

  public constructor(r: RubikModel) {
    super(r);

    this.m = this.r.m;

    this.interface[s.l] = [...this.r.stRotations[0]];
    this.interface[s.r] = [...this.r.opRotations[0]];
    this.interface[s.u] = [...this.r.opRotations[2]];
    this.interface[s.d] = [...this.r.stRotations[2]];
    this.interface[s.f] = [...this.r.stRotations[0]];
    this.interface[s.b] = [...this.r.opRotations[0]];

    this.middle = Math.floor(this.sideLength / 2 - 1);
    this.secondMiddle = this.middle - 1;

    this.currentMiddle = this.middle;

    for (let i = 0; i < this.sideLength - 2; i += 1) {
      this.correctEdges.push(false);
    }

    this.generateEdges();
  }

  solve = () => {
    this.solveEdges();

    this.solveParities();
  }

  solveEdges = () => {
    for (let i = 0; i < this.edges.length; i += 1) {
      this.solveEdge(this.edges[i].firstFace, this.edges[i].secondFace);
    }
  };

  resetCorrectEdges = () => {
    for (let i = 0; i < this.correctEdges.length; i += 1) {
      this.correctEdges[i] = false;
    }
  };

  getNextIncorrectEdge = (): number => {
    for (let i = 0; i < this.correctEdges.length; i += 1) {
      if (this.correctEdges[i] === false) {
        return i;
      }
    }
    return -1;
  };

  // checkEdgeSides = (index: number, edgeOpposite: Edge = this.LF, edgeCorrect: Edge = this.FR): boolean => {
  //   const correctFirst = this.getColorHash(edgeCorrect.firstFace, edgeCorrect.side[this.middle][0]);
  //   const correctSecond = this.getColorHash(edgeCorrect.secondFace, edgeCorrect.side[this.middle][1]);
  //   const oppositeFirst = this.getColorHash(edgeOpposite.firstFace, edgeOpposite.side[index][0]);
  //   const oppositeSecond = this.getColorHash(edgeOpposite.secondFace, edgeOpposite.side[index][1]);
  //   return (correctFirst === oppositeFirst) && (correctSecond === oppositeSecond);
  // };

  checkEdgeSides = (index: number, edgeOpposite: Edge = this.LF, edgeCorrect: Edge = this.FR): boolean => {
    const correctFirst = this.getColorHash(edgeCorrect.firstFace, edgeCorrect.side[this.currentMiddle][0]);
    const correctSecond = this.getColorHash(edgeCorrect.secondFace, edgeCorrect.side[this.currentMiddle][1]);
    const oppositeFirst = this.getColorHash(edgeOpposite.firstFace, edgeOpposite.side[index][0]);
    const oppositeSecond = this.getColorHash(edgeOpposite.secondFace, edgeOpposite.side[index][1]);
    return (correctFirst === oppositeFirst) && (correctSecond === oppositeSecond);
  };

  solveEdgeIndex = (correctHash: number, index: number, e: Edge): boolean => {
    const oppositeIndex = Math.abs(this.sideLength - 3 - index);

    const hashOnIndex = this.getEdgeHashPosition(e, index);
    const hashOnOppositeIndex = this.getEdgeHashPosition(e, oppositeIndex);

    if (hashOnIndex === correctHash) {
      e.rotateOpposite();
      if (this.checkEdgeSides(index)) {
        this.moveOppToCorrect(index);
        this.correctEdges[index] = true;
      } else {
        this.flipWholeEdge();
        this.moveOppToCorrect(oppositeIndex);
        this.correctEdges[oppositeIndex] = true;
      }
      return true;
    }

    if (hashOnOppositeIndex === correctHash) {
      e.rotateOpposite();
      if (this.checkEdgeSides(oppositeIndex)) {
        this.moveOppToCorrect(oppositeIndex);
        this.correctEdges[oppositeIndex] = true;
      } else {
        this.flipWholeEdge();
        this.moveOppToCorrect(index);
        this.correctEdges[index] = true;
      }
      return true;
    }

    return false;
  };

  solveMiddleEven = (correctHash: number) => {
    for (let edge = 0; edge < this.edges.length; edge += 1) {
      const hashOnMiddle = this.getEdgeHashPosition(this.edges[edge], this.middle);
      const hashOnSecondMiddle = this.getEdgeHashPosition(this.edges[edge], this.secondMiddle);
      if (hashOnMiddle === correctHash) {
        this.edges[edge].rotateCorrect();
        this.correctEdges[this.middle] = true;
        this.currentMiddle = this.middle;
        break;
      } else if (hashOnSecondMiddle === correctHash) {
        this.edges[edge].rotateCorrect();
        this.correctEdges[this.secondMiddle] = true;
        this.currentMiddle = this.secondMiddle;
        break;
      }
    }
  };

  solveMiddleOdd = (correctHash: number) => {
    for (let edge = 0; edge < this.edges.length; edge += 1) {
      const hashOnMiddle = this.getEdgeHashPosition(this.edges[edge], this.middle);
      if (hashOnMiddle === correctHash) {
        this.edges[edge].rotateCorrect();
        this.correctEdges[this.middle] = true;
        break;
      }
    }
    this.correctEdges[this.middle] = true;
  };

  solveEdge = (firstFace: number, secondFace: number) => {
    const correctHash = this.getEdgeHashFromFaces(firstFace, secondFace);
    this.resetCorrectEdges();

    if (this.sideLength % 2 === 0) {
      this.solveMiddleEven(correctHash);
    } else {
      this.solveMiddleOdd(correctHash);
    }

    for (let i = 0; i < (this.sideLength - 2) + (this.sideLength - 2); i += 1) {
      const nextEdge = this.getNextIncorrectEdge();
      if (nextEdge === -1) {
        break;
      }
      const hashOnBaseIndex = this.getEdgeHashPosition(this.FR, nextEdge);
      if (correctHash === hashOnBaseIndex) {
        this.correctEdges[nextEdge] = true;
      } else {
        for (let edge = 0; edge < this.edges.length; edge += 1) {
          if (this.solveEdgeIndex(correctHash, nextEdge, this.edges[edge])) {
            break;
          }
        }
      }
    }
  };

  getNextParity = (): ParityInfo => {
    const parityIndexes = [];
    for (let i = 0; i < this.edges.length; i += 1) {
      let found = false;
      for (let e = 0; e < this.sideLength - 2; e += 1) {
        if (!this.checkEdgeSides(e, this.edges[i], this.edges[i])) {
          found = true;
          parityIndexes.push(e);
        }
      }

      if (found) {
        return { edge: this.edges[i], parities: parityIndexes };
      }
    }
    return { edge: null, parities: null };
  };

  rotateFirstHalf = (parityIndexes: number[], move: MoveInterface, clockwise: boolean = true) => {
    for (let i = 0; i < parityIndexes.length / 2; i += 1) {
      move(parityIndexes[i] + 1, clockwise);
    }
  };

  solveParities = () => {
    for (let i = 0; i < 8; i += 1) {
      const { edge, parities } = this.getNextParity();
      if (edge === null) {
        break;
      }

      // console.log(`Parity: ${i + 1}`);
      edge.rotateCorrect();
      this.m.F(0, false);

      this.rotateFirstHalf(parities, this.m.R, false);

      this.m.U();
      this.m.U();

      this.rotateFirstHalf(parities, this.m.L);

      this.m.F();
      this.m.F();

      this.rotateFirstHalf(parities, this.m.L, false);

      this.m.F();
      this.m.F();

      this.rotateFirstHalf(parities, this.m.R, false);
      this.rotateFirstHalf(parities, this.m.R, false);

      this.m.U();
      this.m.U();

      this.rotateFirstHalf(parities, this.m.R);

      this.m.U();
      this.m.U();

      this.rotateFirstHalf(parities, this.m.R, false);

      this.m.U();
      this.m.U();

      this.m.F();
      this.m.F();

      this.rotateFirstHalf(parities, this.m.R, false);
      this.rotateFirstHalf(parities, this.m.R, false);

      this.m.F();
      this.m.F();
    }
  };

  getEdgeHashFromFaces = (firstFace: number, secondFace: number) => Side.getHash(firstFace) + Side.getHash(secondFace);

  getEdgeHash = (e: Edge) => this.getEdgeHashFromFaces(e.firstFace, e.secondFace);

  getEdgeHashPosition = (e: Edge, index: number) => this.getColorHash(e.firstFace, e.side[index][0]) + this.getColorHash(e.secondFace, e.side[index][1]);

  checkEdge = (index: number, hash: number, e: Edge): boolean => {
    const edgeHash = this.getColorHash(e.firstFace, e.side[index][0]) + this.getColorHash(e.secondFace, e.side[index][1]);
    if (edgeHash === hash) {
      return true;
    }
    return false;
  }

  generateEdges = () => {
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

    this.UF = {
      side: upFront,
      firstFace: s.f,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U();
        this.m.L();
      },
      rotateCorrect: () => {
        this.m.F();
      },
    };

    this.UR = {
      side: upRight,
      firstFace: s.r,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U();
        this.m.U();
        this.m.L();
      },
      rotateCorrect: () => {
        this.m.U(0, false);
        this.m.B(0, false);
        this.m.R();
        this.m.R();
      },
    };


    this.UB = {
      side: upBack,
      firstFace: s.b,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.U(0, false);
        this.m.L();
      },
      rotateCorrect: () => {
        this.m.B(0, false);
        this.m.R();
        this.m.R();
      },
    };

    this.UL = {
      side: upLeft,
      firstFace: s.l,
      secondFace: s.u,
      rotateOpposite: () => {
        this.m.L();
      },
      rotateCorrect: () => {
        this.m.L(0, false);
        this.m.B(0, false);
        this.m.U();
        this.m.R(0, false);
      },
    };

    this.DF = {
      side: downFront,
      firstFace: s.f,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D(0, false);
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        this.m.F(0, false);
      },
    };

    this.DL = {
      side: downLeft,
      firstFace: s.l,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        this.m.D(0, false);
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    this.DB = {
      side: downBack,
      firstFace: s.b,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D();
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    this.DR = {
      side: downRight,
      firstFace: s.r,
      secondFace: s.d,
      rotateOpposite: () => {
        this.m.D();
        this.m.D();
        this.m.L(0, false);
      },
      rotateCorrect: () => {
        this.m.D();
        this.m.B();
        this.m.R();
        this.m.R();
      },
    };

    this.FR = {
      side: leftRight,
      firstFace: s.f,
      secondFace: s.r,
      rotateOpposite: () => {
        // do nothing
      },
      rotateCorrect: () => {
        // do nothing
      },
    };

    this.RB = {
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
        this.m.B();
        this.m.U();
        this.m.R(0, false);
      },
    };

    this.BL = {
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

    this.LF = {
      side: leftRight,
      firstFace: s.l,
      secondFace: s.f,
      rotateOpposite: () => {
        // do nothing
      },
      rotateCorrect: () => {
        this.m.L(0, false);
        this.m.U(0, false);
        this.m.F();
      },
    };

    this.edges = [
      this.UF,
      this.UR,
      this.UB,
      this.UL,
      this.DF,
      this.DR,
      this.DB,
      this.DL,
      this.RB,
      this.BL,
      this.LF,
      this.FR,
    ];
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
  }
}

export default SolveEdgesRubik;
