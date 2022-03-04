import React from 'react';
import styled, { css } from 'styled-components';
import RubikView from '../rubik/view';

interface addRubik {
  (length: number): void;
}

type RubikProps = {
  rubik: RubikView,
  addRubik: addRubik,
}

const TextDisplay = styled.div`
  color: white;
  font-size: 30px;
  text-align: center;
`;

const SizeDisplay = styled.div`
  display: inline-block;
  margin: 0 auto;
  color: white;
  font-size: 30;
  width: 40%;
  text-align: center;
`;

const buttonBase = css`
  background-color: grey;
  width: 30%;
  height: 30px;
`;

const SizeDownButton = styled.button`
  ${buttonBase};
  float: left;
`;

const SizeUpButton = styled.button`
  ${buttonBase};
  float: right;
`;

const SizeButtonPanel = (props: RubikProps) => {
  const rubikResize = (size: number) => {
    if (size >= 3) {
      props.addRubik(size);
    }
  };

  const length = props.rubik.getLength();

  return (
    <>
      <TextDisplay>Size:</TextDisplay>
      <div>
        <SizeDownButton onClick={() => rubikResize(length - 1)}>{'-'}</SizeDownButton>
        <SizeDisplay>{length}</SizeDisplay>
        <SizeUpButton onClick={() => rubikResize(length + 1)}>{'+'}</SizeUpButton>
      </div>
    </>
  );
};

export default SizeButtonPanel;
