import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import RubikView from '../rubik/view';

type RubikProps = {
  rubik: RubikView
}

const RotateButtonPanel = (props: RubikProps) => {
  return (
    <>
      <div>Rotate</div>
      <div>
        <RotateButton onClick={props.rubik.cubeRotationOperations.up}>{'Up'}</RotateButton>
        <RotateButton onClick={props.rubik.cubeRotationOperations.down}>{'Down'}</RotateButton>
        <RotateButton onClick={props.rubik.cubeRotationOperations.left}>{'Left'}</RotateButton>
        <RotateButton onClick={props.rubik.cubeRotationOperations.right}>{'Right'}</RotateButton>
        <RotateButton onClick={props.rubik.cubeRotationOperations.counter}>{'Counter'}</RotateButton>
        <RotateButton onClick={props.rubik.cubeRotationOperations.clockwise}>{'Clockwise'}</RotateButton>
      </div>
    </>
  );
};

const RotateButton = styled.button`
  width: 50%; 
`;

export default RotateButtonPanel;
