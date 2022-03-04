import React from 'react';
import styled from 'styled-components';
import RubikView from '../rubik/view';

type RubikProps = {
  rubik: RubikView,
}

const StandardButton = (props: RubikProps) => {
  return (
    <>
      <StyleButton onClick={() => props.rubik.scramble(20)}>scramble</StyleButton>
      <StyleButton onClick={() => props.rubik.moveBack()}>back</StyleButton>
      <StyleButton onClick={() => props.rubik.moveForward()}>forward</StyleButton>
      <StyleButton onClick={() => props.rubik.solve()}>solve</StyleButton>
      <StyleButton onClick={() => props.rubik.stopAnimation()}>stop</StyleButton>
      {/* <button onClick={() => props.rubik.doMoves}></button> */}
    </>
  );
};

const StyleButton = styled.button`
  background-color: grey;
  border-radius: 12px;
  opacity: 80%;
  width: 20%;
  height: 100%;
  font-size: 15px;
  font-weight: 900;
`;

export default StandardButton;
