import React from 'react';
import ReactDOM from 'react-dom';
import RubikView from '../rubik/view';

type RubikProps = {
  rubik: RubikView
}

const RotateButtonPanel = (props: RubikProps) => {
  return (
    <div>
      <button onClick={props.rubik.cubeRotationOperations.up}>{'Up'}</button>
      <button onClick={props.rubik.cubeRotationOperations.down}>{'Down'}</button>
      <button onClick={props.rubik.cubeRotationOperations.left}>{'Left'}</button>
      <button onClick={props.rubik.cubeRotationOperations.right}>{'Right'}</button>
      <button onClick={props.rubik.cubeRotationOperations.clockwise}>{'Clockwise'}</button>
      <button onClick={props.rubik.cubeRotationOperations.counter}>{'Counter'}</button>
    </div>
  );
};

export default RotateButtonPanel;
