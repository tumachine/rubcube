/* eslint-disable max-len */
import RubikSolutionBase from './rubikSolutionBase';
import MoveActions from '../moveActions';
import RubikModel from '../model';
import { sides as s, colorHashes } from '../utils';

class SolveStandardRubik extends RubikSolutionBase {
  public frontOrient: MoveActions[];

  public sideOrient: MoveActions[];

  private faceCases: Array<Array<number>> = [[], [], [], []]

  private sideCases: Array<Array<number>> = [[], [], [], []]

  private faceCornerCases: Array<Array<number>> = [[], [], [], []]

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m = rubik.moves;

    this.interface[s.l] = [...this.rubik.stRotations[3]];
    this.interface[s.r] = [...this.rubik.opRotations[3]];
    this.interface[s.u] = [...this.rubik.opRotations[2]];
    this.interface[s.d] = [...this.rubik.stRotations[2]];
    this.interface[s.f] = [...this.rubik.stRotations[0]];
    this.interface[s.b] = [...this.rubik.stRotations[0]];

    this.generateFaceSideCases();

    this.frontOrient = [
      // left
      {
        U: this.m.L,
        D: this.m.R,
        L: this.m.D,
        R: this.m.U,
        F: this.m.F,
        B: this.m.B,
      },
      // right
      {
        U: this.m.R,
        D: this.m.L,
        L: this.m.U,
        R: this.m.D,
        F: this.m.F,
        B: this.m.B,
      },
      // up
      {
        U: this.m.U,
        D: this.m.D,
        L: this.m.L,
        R: this.m.R,
        F: this.m.F,
        B: this.m.B,
      },
      // down
      {
        U: this.m.D,
        D: this.m.U,
        L: this.m.R,
        R: this.m.L,
        F: this.m.F,
        B: this.m.B,
      },
    ];

    this.sideOrient = [
      // left
      {
        U: this.m.B,
        D: this.m.F,
        L: this.m.D,
        R: this.m.U,
        F: this.m.L,
        B: this.m.R,
      },
      // right
      {
        U: this.m.B,
        D: this.m.F,
        L: this.m.U,
        R: this.m.D,
        F: this.m.R,
        B: this.m.L,
      },
      // up
      {
        U: this.m.B,
        D: this.m.F,
        L: this.m.L,
        R: this.m.R,
        F: this.m.U,
        B: this.m.D,
      },
      // down
      {
        U: this.m.B,
        D: this.m.F,
        L: this.m.R,
        R: this.m.L,
        F: this.m.D,
        B: this.m.U,
      },
    ];
  }

  private generateFaceSideCases = () => {
    // need an array for FCA = [this.f.ul, this.f.ur, this.f.dr, this.f.dl]
    const leftFaceCases = [this.f.l, this.f.u, this.f.r, this.f.d];
    const leftSideCases = [s.l, s.u, s.r, s.d];
    const leftFaceCornerCases = [this.f.ul, this.f.ur, this.f.dr, this.f.dl];
    for (let i = 0; i < 4; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        this.faceCases[i][j] = leftFaceCases[(j + i) % 4];
        this.sideCases[i][j] = leftSideCases[(j + i) % 4];
        this.faceCornerCases[i][j] = leftFaceCornerCases[(j + i) % 4];
      }
    }
  }

  solveWhiteCross = () => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCrossSide(this.faceCases[i], this.sideCases[i]);
    }
  }

  solveWhiteFace = (sca: number[][], fca: number[][]) => {
    for (let i = 0; i < 4; i += 1) {
      this.solveWhiteCornerSide(sca[i], fca[i]);
    }
  }

  solveWhiteCornerSide = (sc: number[], fc: number[]) => {
    // check if already correct
    if (this.check(sc[0], this.f.dr, sc[0]) && (this.check(sc[1], this.f.dl, sc[1]) && (this.check(s.f, fc[0], s.f)))) {
      console.log('corner is in a right place');
      return;
    }

    // this
    // find cube where sum of the colors equals, sum of the desired cube
    // can check bottom and top with this solution
    let desiredSum = 0;
    desiredSum += colorHashes[sc[0]];
    desiredSum += colorHashes[sc[1]];
    desiredSum += colorHashes[s.f];
    // front
    let sum = 0;
    let frontFaceSide = null;
    for (let i = 0; i < 4; i += 1) {
      sum = 0;
      sum += this.getColorHash(sc[i], this.f.dr);
      sum += this.getColorHash(sc[(i + 1) % 4], this.f.dl);
      sum += this.getColorHash(s.f, fc[i]);
      if (sum === desiredSum) {
        frontFaceSide = i;

        break;
      }
    }

    if (frontFaceSide !== null) {
      this.sideOrient[sc[frontFaceSide]].R();
      this.sideOrient[sc[frontFaceSide]].U();
      this.sideOrient[sc[frontFaceSide]].R(0, false);

      if (frontFaceSide === 0) {
        this.m.B(0, false);
      }
      if (frontFaceSide === 1) {
        // do nothing
      }
      if (frontFaceSide === 2) {
        this.m.B();
      }
      if (frontFaceSide === 3) {
        this.m.B();
        this.m.B();
      }
    }


    // bottom
    let backFaceSide = null;
    if (frontFaceSide === null) {
      for (let i = 0; i < 4; i += 1) {
        sum = 0;
        sum += this.getColorHash(sc[i], this.f.ur);
        sum += this.getColorHash(sc[(i + 1) % 4], this.f.ul);
        sum += this.getColorHash(s.b, fc[i]);
        if (sum === desiredSum) {
          backFaceSide = i;
          break;
        }
      }
      if (backFaceSide === 0) {
        // do nothing
      }
      if (backFaceSide === 1) {
        this.m.B();
      }
      if (backFaceSide === 2) {
        this.m.B();
        this.m.B();
      }
      if (backFaceSide === 3) {
        this.m.B(0, false);
      }
    }

    // place it on the right side
    // for (let i = 0; i < 4; i += 1) {
    // there can now be only three cases, after putting
    // case 1: white to the right
    if (this.check(sc[0], this.f.ur, s.f) && (this.check(sc[1], this.f.ul, sc[1]))) {
      this.frontOrient[sc[1]].L(0, false);
      this.m.B(0, false);
      this.frontOrient[sc[1]].L();
      console.log('solved case 1');
      return;
    }
    // case 2: white in the left
    if (this.check(sc[0], this.f.ur, sc[0]) && (this.check(sc[1], this.f.ul, s.f))) {
      this.frontOrient[sc[0]].R();
      this.m.B();
      this.frontOrient[sc[0]].R(0, false);
      console.log('solved case 2');
      return;
    }
    // case 3: white in the bottom
    if (this.check(sc[0], this.f.ur, sc[1]) && (this.check(sc[1], this.f.ul, sc[0]))) {
      this.frontOrient[sc[1]].L(0, false);
      this.m.B();
      this.m.B();
      this.frontOrient[sc[1]].L();
      this.m.B();

      this.frontOrient[sc[1]].L(0, false);
      this.m.B(0, false);

      this.frontOrient[sc[1]].L();
      console.log('solved case 3');
    }
  }

  solveWhiteCrossSide = (fc: number[], sc: number[]) => {
    let count = 0;

    while (!(this.check(sc[0], this.f.d, sc[0]) && (this.check(s.f, fc[0], s.f)))) {
      // correct on left
      // need a simpler way to check colors
      // if (this.getColor(s.l, this.f.l) === s.l && this.getColor(s.d, this.f.r) === s.f) {
      // up, right, down, left
      if (this.check(sc[0], this.f.l, sc[0]) && this.check(sc[3], this.f.r, s.f)) {
        this.frontOrient[sc[0]].U(0, false);
        console.log('left left');
        return;
      }
      // correct on top
      if (this.check(sc[0], this.f.u, sc[0]) && this.check(s.b, fc[0], s.f)) {
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('left top');
        return;
      }

      // correct on right
      if (this.check(sc[0], this.f.r, sc[0]) && this.check(sc[1], this.f.l, s.f)) {
        this.frontOrient[sc[0]].U();
        console.log('left right');
        return;
      }

      // for reverse colors, move them to the right
      // left
      if (this.check(sc[0], this.f.l, s.f) && this.check(sc[3], this.f.r, sc[0])) {
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('reverse left left');
      } else if (this.check(sc[0], this.f.u, s.f) && this.check(s.b, fc[0], sc[0])) {
        // top
        this.frontOrient[sc[0]].U();
        console.log('reverse top left');
      } else if (this.check(sc[0], this.f.d, s.f) && this.check(s.f, fc[0], sc[0])) {
        // down
        this.frontOrient[sc[0]].U(0, false);
        console.log('reverse down left');
      }

      // solve reverse face case
      if (this.check(sc[0], this.f.r, s.f) && this.check(sc[1], this.f.l, sc[0])) {
        this.frontOrient[sc[1]].U();
        this.m.B();
        this.frontOrient[sc[1]].U(0, false);
        this.frontOrient[sc[0]].U();
        this.frontOrient[sc[0]].U();
        console.log('reverse face case');
        return;
      }

      // solve for top left
      if ((this.check(sc[2], this.f.l, sc[0]) && this.check(sc[1], this.f.r, s.f))
        || (this.check(sc[2], this.f.l, s.f) && this.check(sc[1], this.f.r, sc[0]))) {
        this.frontOrient[sc[0]].D();
        this.m.B();
        this.frontOrient[sc[0]].D(0, false);
        this.m.B();
        console.log('top hard side');
      }

      // solve for bottom left
      if ((this.check(sc[2], this.f.r, sc[0]) && this.check(sc[3], this.f.l, s.f))
        || (this.check(sc[2], this.f.r, s.f) && this.check(sc[3], this.f.l, sc[0]))) {
        this.frontOrient[sc[0]].L();
        this.m.B();
        this.frontOrient[sc[0]].L(0, false);
        this.m.B();
        console.log('bottom hard side');
      }

      // solve for face top
      if ((this.check(sc[1], this.f.d, sc[0]) && this.check(s.f, fc[1], s.f))
        || (this.check(sc[1], this.f.d, s.f) && this.check(s.f, fc[1], sc[0]))) {
        this.frontOrient[sc[0]].R();
        this.frontOrient[sc[0]].R();
        console.log('front top hard face');
      }

      // solve for face right
      if ((this.check(sc[2], this.f.d, sc[0]) && this.check(s.f, fc[2], s.f))
        || (this.check(sc[2], this.f.d, s.f) && this.check(s.f, fc[2], sc[0]))) {
        this.frontOrient[sc[0]].D();
        this.frontOrient[sc[0]].D();
        console.log('front right hard face');
      }

      // solve for face bottom
      if ((this.check(sc[3], this.f.d, sc[0]) && this.check(s.f, fc[3], s.f))
        || (this.check(sc[3], this.f.d, s.f) && this.check(s.f, fc[3], sc[0]))) {
        this.frontOrient[sc[0]].L();
        this.frontOrient[sc[0]].L();
        console.log('front bottom hard face');
      }

      // this solves another three cases for bottom
      this.m.B();

      console.log('solving');

      if (count === 10) {
        break;
      }
      count += 1;
    }
  }

  solve = () => {
    this.solveWhiteCross();
    this.solveWhiteFace(this.sideCases, this.faceCornerCases);

    // don't use them for 2x2 cube maybe
    this.solveMiddleLayer();
    this.solveYellowCross();

    this.solveSwapYellowEdges();
    this.solvePositionYellowCorners();
    this.solveOrientLastLayerCorners();
  }

  solveOrientLastLayerCorners = () => {
    // check only from one side
    // move not correctly oriented cubes to the check side
    // do the algorithm 2 or 4 times, until faces yellow
    const firstSide = this.sideOrient[0];

    const applyAlgo = (num) => {
      for (let i = 0; i < num; i += 1) {
        this.solveOrientLastLayerCornersCase(firstSide);
      }
    };
    // find incorrect piece
    // rotate it toward first side
    const fc = this.faceCornerCases[0];
    const findAndRotate = () => {
      for (let i = 0; i < 4; i += 1) {
        if (!this.check(s.b, fc[i], s.b)) {
          if (i === 0) {
            // do nothing
          } else if (i === 1) {
            this.m.B();
          } else if (i === 2) {
            this.m.B();
            this.m.B();
          } else if (i === 3) {
            this.m.B(0, false);
          }
          return true;
        }
      }
      return false;
    };

    // make it so yellow is on top
    // by applying algorithm 2 or 4 times
    for (let i = 0; i < 4; i += 1) {
      if (findAndRotate()) {
        applyAlgo(2);
        if (!this.check(s.b, fc[0], s.b)) {
          applyAlgo(2);
        }
      } else {
        break;
      }
    }


    for (let i = 0; i < 4; i += 1) {
      if (!this.check(s.l, this.f.u, s.l)) {
        this.m.B();
      } else {
        break;
      }
    }
  }

  solveOrientLastLayerCornersCase = (orientation: MoveActions) => {
    // R' D' R D
    orientation.R(0, false);
    orientation.D(0, false);
    orientation.R();
    orientation.D();
  }

  solvePositionYellowCornersCase = (orientation: MoveActions) => {
    // U R U' L' U R' U' L
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.L(0, false);
    orientation.U();
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.L();
    console.log('Yellow corner case');
  }

  solvePositionYellowCorners = () => {
    // find cube on correct position
    let totalCorrect = 0;
    let correctPos = null;

    const findCorrectCube = () => {
      correctPos = null;
      totalCorrect = 0;
      for (let i = 0; i < 4; i += 1) {
        const sc = this.sideCases[i];
        const fc = this.faceCornerCases[i];

        let desiredSum = 0;
        desiredSum += colorHashes[sc[0]];
        desiredSum += colorHashes[sc[1]];
        desiredSum += colorHashes[s.b];

        let sum = 0;
        sum += this.getColorHash(sc[0], this.f.ur);
        sum += this.getColorHash(sc[1], this.f.ul);
        sum += this.getColorHash(s.b, fc[0]);
        if (sum === desiredSum) {
          correctPos = i;
          totalCorrect += 1;
        }
      }
    };

    findCorrectCube();
    if (totalCorrect === 4) {
      console.log('yellow corners were initially in correct position');
      return;
    }


    // choose random orientation, instead just chose 0
    for (let i = 0; i < 10; i += 1) {
      if (correctPos === null) {
        const orientation = this.sideOrient[0];
        this.solvePositionYellowCornersCase(orientation);
        // assume that cube will be correct
        findCorrectCube();
        if (totalCorrect === 4) {
          console.log('yellow corners solved');
          return;
        }
      } else {
        break;
      }
    }

    for (let i = 0; i < 10; i += 1) {
      findCorrectCube();
      if (totalCorrect !== 4) {
        this.solvePositionYellowCornersCase(this.sideOrient[(correctPos + 1) % 4]);
      } else {
        console.log('solved it');
        break;
      }
    }
  }

  solveSwapYellowEdges = () => {
    const sc = this.sideCases[0];
    const checkComplete = () => {
      let count = 0;
      for (let i = 0; i < 4; i += 1) {
        if (this.check(sc[i], this.f.u, sc[i])) {
          count += 1;
        }
      }
      if (count === 4) {
        return true;
      }
      return false;
    };

    // rotate until at least one color matches
    // lazy check
    for (let i = 0; i < 4; i += 1) {
      if (this.check(sc[0], this.f.u, sc[0])) {
        console.log('found correct side for yellow case');
        break;
      }
      this.m.B();
    }

    if (checkComplete()) {
      console.log('All yellow edges are correct');
      return;
    }

    // check if there are opposite cubes
    if (this.check(sc[1], this.f.u, sc[3]) && (this.check(sc[3], this.f.u, sc[1]))) {
      let orientation = this.sideOrient[sc[0]];
      orientation.U();
      this.solveSwapYellowEdgesCase(orientation);
      orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('opposite cubes');
      return;
    }


    // next cube is of the same color as first side
    if (this.check(sc[2], this.f.u, sc[3])) {
      const orientation = this.sideOrient[sc[3]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved second cube');
    }

    if (this.check(sc[1], this.f.u, sc[2])) {
      const orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved third cube');
    }

    if (this.check(sc[3], this.f.u, sc[2]) && (this.check(sc[2], this.f.u, sc[1]))) {
      let orientation = this.sideOrient[sc[2]];
      this.solveSwapYellowEdgesCase(orientation);
      orientation = this.sideOrient[sc[3]];
      this.solveSwapYellowEdgesCase(orientation);
      console.log('solved unique position cube');
    }
  }

  solveSwapYellowEdgesCase = (orientation: MoveActions) => {
    // R U R' U R U2 R' U
    orientation.R();
    orientation.U();
    orientation.R(0, false);
    orientation.U();
    orientation.R();
    orientation.U();
    orientation.U();
    orientation.R(0, false);
    orientation.U();
  }

  solveYellowCrossAllCase = (orientation: MoveActions) => {
    // F R U R' U' F'
    orientation.F();
    orientation.R();
    orientation.U();
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.F(0, false);
    console.log('Yellow cross case ALL');
  }

  solveYellowCrossShortcutCase = (orientation: MoveActions) => {
    // F U R U' R' F'
    orientation.F();
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.R(0, false);
    orientation.F(0, false);
    console.log('Yellow cross case SHORTCUT');
  }

  solveYellowCross = () => {
    // detect 4 cases:
    //  dot
    //  L
    //  line
    //  complete
    let orientation = null;
    console.log(this.sideCases);

    for (let i = 0; i < 10; i += 1) {
      // complete case
      if (this.check(s.b, this.f.l, s.b)
        && this.check(s.b, this.f.u, s.b)
        && this.check(s.b, this.f.r, s.b)
        && this.check(s.b, this.f.d, s.b)) {
        console.log('yellow cross is complete');
        break;
      } else if (!this.check(s.b, this.f.l, s.b)
        && !this.check(s.b, this.f.u, s.b)
        && !this.check(s.b, this.f.r, s.b)
        && !this.check(s.b, this.f.d, s.b)) {
        // dot case
        console.log('dot case');
        orientation = this.sideOrient[this.sideCases[0][0]];
      } else if (this.check(s.b, this.f.l, s.b)
        && this.check(s.b, this.f.r, s.b)) {
        // line case
        console.log('line case');
        orientation = this.sideOrient[this.sideCases[0][1]];
      } else if (this.check(s.b, this.f.u, s.b)
        && this.check(s.b, this.f.d, s.b)) {
        // line case
        console.log('line case');
        orientation = this.sideOrient[this.sideCases[0][0]];
      } else {
        // L case
        for (let j = 0; j < 4; j += 1) {
          if (this.check(s.b, this.faceCases[0][(j + 3) % 4], s.b) && this.check(s.b, this.faceCases[0][(j + 2) % 4], s.b)) {
            console.log(j);
            orientation = this.sideOrient[this.sideCases[0][j]];
            console.log('L case');
            break;
          }
        }
      }
      if (orientation === null) {
        orientation = this.sideOrient[this.sideCases[0][i % 4]];
      }

      this.solveYellowCrossAllCase(orientation);
    }
  }


  solveMiddleLayerLeftCase = (orientation: MoveActions) => {
    // U' L' U L U F U' F'
    orientation.U(0, false);
    orientation.L(0, false);
    orientation.U();
    orientation.L();
    orientation.U();
    orientation.F();
    orientation.U(0, false);
    orientation.F(0, false);
    console.log('Middle case LEFT');
  }

  solveMiddleLayerRightCase = (orientation: MoveActions) => {
    // U R U' R' U' F' U F
    orientation.U();
    orientation.R();
    orientation.U(0, false);
    orientation.R(0, false);
    orientation.U(0, false);
    orientation.F(0, false);
    orientation.U();
    orientation.F();
    console.log('Middle case RIGHT');
  }

  solveMiddleLayerSide = (fc, sc) => {
    // rotate until color is the same, and
    // depending on the second color, use algorithm

    // three cases for back side with back rotations, determine number of back rotations
    // check for right side
    // create a check if a side already correct
    if (this.check(sc[0], this.f.r, sc[0]) && (this.check(sc[1], this.f.l, sc[1]))) {
      console.log('middle layer side already correct');
      // already correct
      return;
    }

    // cube is in the middle
    // move it to top
    for (let i = 0; i < 4; i += 1) {
      if (this.check(sc[i], this.f.r, sc[1]) && this.check(sc[(i + 1) % 4], this.f.l, sc[0])) {
        console.log('middle opposite', i);
        this.solveMiddleLayerRightCase(this.sideOrient[sc[i]]);
        if (i === 0) {
          this.m.B();
          this.m.B();
        } else if (i === 1) {
          this.m.B(0, false);
        } else if (i === 2) {
          // do nothing
        } else if (i === 3) {
          this.m.B();
        }
        this.solveMiddleLayerRightCase(this.sideOrient[sc[0]]);
        break;
      }
      if (this.check(sc[i], this.f.r, sc[0]) && this.check(sc[(i + 1) % 4], this.f.l, sc[1])) {
        console.log('middle same ', i);
        this.solveMiddleLayerRightCase(this.sideOrient[sc[i]]);
        if (i === 0) {
          this.m.B();
        } if (i === 1) {
          this.m.B();
          this.m.B();
        } else if (i === 2) {
          this.m.B(0, false);
        } else if (i === 3) {
          // do nothing
        }
        this.solveMiddleLayerLeftCase(this.sideOrient[sc[1]]);
        break;
      }

      if (this.check(sc[i], this.f.u, sc[0]) && this.check(s.b, fc[i], sc[1])) {
        // 3 is incorrect
        console.log('top same', i);
        if (i === 0) {
          // do nothing
        } else if (i === 1) {
          this.m.B();
        } else if (i === 2) {
          this.m.B();
          this.m.B();
        } else if (i === 3) {
          this.m.B(0, false);
        }

        this.solveMiddleLayerRightCase(this.sideOrient[sc[0]]);
        break;
      }
      if (this.check(sc[i], this.f.u, sc[1]) && this.check(s.b, fc[i], sc[0])) {
        console.log('top opposite', i);
        if (i === 0) {
          this.m.B(0, false);
        } else if (i === 1) {
          // do nothing
        } else if (i === 2) {
          this.m.B();
        } else if (i === 3) {
          this.m.B();
          this.m.B();
        }
        this.solveMiddleLayerLeftCase(this.sideOrient[sc[1]]);
        break;
      }
    }
  }

  solveMiddleLayer = () => {
    for (let i = 0; i < 4; i += 1) {
      this.solveMiddleLayerSide(this.faceCases[i], this.sideCases[i]);
    }
  }
}

export default SolveStandardRubik;
