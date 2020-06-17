import React from 'react';
import ReactDOM from 'react-dom';
import { MoveHistory, Side } from '../rubik/utils';
import { Jump } from '../d';
import RubikView from '../rubik/view';

type RubikProps = {
  rubik: RubikView,
}

const StandardButton = (props: RubikProps) => {
  return (
    <div style={{color: 'white'}}>
      <button onClick={() => props.rubik.stopAnimation()}>stop</button>
      {/* <button onClick={() => props.rubik.doMoves}></button> */}
      <button onClick={() => props.rubik.scramble(20)}>scramble</button>
      <button onClick={() => props.rubik.solve()}>solve</button>
      <button onClick={() => props.rubik.moveBack()}>back</button>
      <button onClick={() => props.rubik.moveForward()}>forward</button>
    </div>
  );
};

export default StandardButton;
