/* eslint-disable max-len */
import RubikModel from '../model';
import MoveActions from '../moveActions';
import { sides as s, colorHashes } from '../utils';
import { FindReturn } from './d';
import RubikSolutionBase from './rubikSolutionBase';
import Move from '../move';
import SolveStandardRubik from './solveStandardRubik';

interface Side {
  color: number,
  moves: MoveActions,
  upLeft: number,
  upRight: number,
  upMiddle: number,
  flipMoveReturn: Function,
}

class SolveEvenRubikParities extends RubikSolutionBase {
  public sides: Side[];

  public solveStandard: SolveStandardRubik;

  public constructor(rubik: RubikModel) {
    super(rubik);

    this.m.L = rubik.moves.L;
    this.m.R = rubik.moves.R;
    this.m.F = rubik.moves.F;
    this.m.B = rubik.moves.B;
    this.m.U = rubik.moves.U;
    this.m.D = rubik.moves.D;

    this.interface[s.l] = [...this.rubik.stRotations[3]];
    this.interface[s.r] = [...this.rubik.opRotations[3]];
    this.interface[s.u] = [...this.rubik.opRotations[2]];
    this.interface[s.d] = [...this.rubik.stRotations[2]];
    this.interface[s.f] = [...this.rubik.stRotations[0]];
    this.interface[s.b] = [...this.rubik.opRotations[0]];

    const leftMoves: MoveActions = {
      U: this.m.B,
      D: this.m.F,
      L: this.m.D,
      R: this.m.U,
      F: this.m.L,
      B: this.m.R,
      // U: this.m.R,
      // D: this.m.L,
      // L: this.m.D,
      // R: this.m.U,
      // F: this.m.B,
      // B: this.m.F,
    };

    const rightMoves: MoveActions = {
      U: this.m.B,
      D: this.m.F,
      L: this.m.U,
      R: this.m.D,
      F: this.m.R,
      B: this.m.L,
      // U: this.m.L,
      // D: this.m.R,
      // L: this.m.U,
      // R: this.m.D,
      // F: this.m.B,
      // B: this.m.F,
    };

    const upMoves: MoveActions = {
      U: this.m.B,
      D: this.m.F,
      L: this.m.L,
      R: this.m.R,
      F: this.m.U,
      B: this.m.D,
      // U: this.m.D,
      // D: this.m.U,
      // L: this.m.L,
      // R: this.m.R,
      // F: this.m.B,
      // B: this.m.F,
    };

    const downMoves: MoveActions = {
      U: this.m.B,
      D: this.m.F,
      L: this.m.R,
      R: this.m.L,
      F: this.m.D,
      B: this.m.U,
      // U: this.m.U,
      // D: this.m.D,
      // L: this.m.R,
      // R: this.m.L,
      // F: this.m.D,
      // B: this.m.U,
    };

    // 0 rotate all m.F(); l
    // 1 rotate all m.F(false); r
    // 2 rotate all m.L(false); u
    // 3 rotate all m.L(); d

    const left: Side = {
      color: s.l,
      moves: leftMoves,
      upLeft: this.f.dr,
      upRight: this.f.ur,
      upMiddle: this.f.r,
      flipMoveReturn: () => this.rotateAll(this.m.U),
      // rotateMoveReturn: () => this.rotateAll(this.m.U, false),
    };

    const right: Side = {
      color: s.r,
      moves: rightMoves,
      upLeft: this.f.ul,
      upRight: this.f.dl,
      upMiddle: this.f.l,
      flipMoveReturn: () => this.rotateAll(this.m.U, false),
    };

    const up: Side = {
      color: s.u,
      moves: upMoves,
      upLeft: this.f.ur,
      upRight: this.f.ul,
      upMiddle: this.f.u,
      flipMoveReturn: () => this.rotateAll(this.m.R),
    };

    const down: Side = {
      color: s.d,
      moves: downMoves,
      upLeft: this.f.dl,
      upRight: this.f.dr,
      upMiddle: this.f.d,
      flipMoveReturn: () => this.rotateAll(this.m.L),
    };

    this.sides = [left, right, up, down];

    // parities
    // flipped edge: OLL Parity 3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'
    // swapped pieces: PLL Parity 3Rw2 F2 U2 3Rw2 R2 U2 F2 3Rw2
    // we need to get only 4 edges
    // and 4 corners
    // find a parity
    // move to a position
    // apply an algorithm
    // solve yellow
    // this.solveSwapYellowEdges();
    // this.solvePositionYellowCorners();
    // this.solveOrientLastLayerCorners();

    this.solveStandard = new SolveStandardRubik(this.rubik);
  }

  solve = () => {
    // const edge = this.findFlippedEdge();
    // console.log(edge);
    // if (edge !== null) {
    //   console.log('Found flipped edge');
    //   console.log(edge.color);
    //   this.solveFlippedEdge(edge.moves);
    //   console.log(edge.upMiddle);
    //   edge.flipMoveReturn();
    //   this.solveStandardRubik();
    // }

    // const edge = this.findSwappedPieces();
    // console.log(edge);
    // if (edge !== null) {
    //   console.log('Found swapped pieces');
    //   console.log(edge.color);
    //   this.solveRotatedPieces(edge.moves);
    //   console.log(edge.upMiddle);
    //   this.solveStandardRubik();
    // }

    for (let i = 0; i < 5; i += 1) {
      console.log(i);
      let edge = this.findFlippedEdge();
      if (edge !== null) {
        console.log('Found flipped edge');
        this.solveFlippedEdge(edge.moves);
        edge.flipMoveReturn();
        this.solveStandardRubik();
      }
      edge = this.findSwappedPieces();
      if (edge !== null) {
        console.log('Found swapped pieces');
        this.solveRotatedPieces(edge.moves);
        this.solveStandardRubik();
      }
      if (edge === null) {
        break;
      }
    }
  }

  checkCorrect = (): boolean => {
    const start = (this.sideLength - 1) * this.sideLength;
    const end = this.sideLength * this.sideLength;
    for (let i = 0; i < this.sides.length; i += 1) {
      for (let dir = start; dir < end; dir += 1) {
        if (!this.check(this.sides[i].color, dir, this.sides[i].color)) {
          return false;
        }
      }
    }
    return true;
  }

  solveStandardRubik = () => {
    this.solveStandard.solveSwapYellowEdges();
    this.solveStandard.solvePositionYellowCorners();
    this.solveStandard.solveOrientLastLayerCorners();
  }

  findFlippedEdge = (): Side => {
    for (let i = 0; i < this.sides.length; i += 1) {
      const side: Side = this.sides[i];
      // if (this.check(side.color, this.f.u, s.b) && this.check(s.b, side.upMiddle, side.color)) {
      if (this.check(side.color, this.f.u, s.b)) {
        return side;
      }
    }
    return null;
  }

  findSwappedPieces = (): Side => {
    for (let i = 0; i < this.sides.length; i += 1) {
      const side: Side = this.sides[i];
      if (!this.check(side.color, this.f.u, side.color) || !this.check(side.color, this.f.ur, side.color)) {
        return side;
      }
    }
    return null;
  }


  rotateHalf = (move: MoveInterface, clockwise = true) => {
    for (let i = 0; i < this.middle; i += 1) {
      move(i, clockwise);
    }
  }

  rotateAll = (move: MoveInterface, clockwise = true) => {
    for (let i = 0; i < this.sideLength; i += 1) {
      move(i, clockwise);
    }
  }

  // flipped edge: OLL Parity 3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'
  solveFlippedEdge = (m: MoveActions) => {
    this.rotateHalf(m.R);
    m.U();
    m.U();

    this.rotateHalf(m.R);

    m.F();
    m.F();

    this.rotateHalf(m.R);

    m.F();
    m.F();

    this.rotateHalf(m.R, false);

    m.F();
    m.F();

    this.rotateHalf(m.L);

    m.F();
    m.F();

    this.rotateHalf(m.R, false);

    m.F();
    m.F();

    this.rotateHalf(m.R);

    m.F();
    m.F();

    this.rotateHalf(m.R, false);

    m.F();
    m.F();

    this.rotateHalf(m.R, false);
  }

  // swapped pieces: PLL Parity 3Rw2 F2 U2 3Rw2 R2 U2 F2 3Rw2
  solveRotatedPieces = (m: MoveActions) => {
    this.rotateHalf(m.R);
    this.rotateHalf(m.R);

    m.F();
    m.F();

    m.U();
    m.U();

    this.rotateHalf(m.R);
    this.rotateHalf(m.R);

    m.R();
    m.R();

    m.U();
    m.U();

    m.F();
    m.F();

    this.rotateHalf(m.R);
    this.rotateHalf(m.R);
  }
}

export default SolveEvenRubikParities;
