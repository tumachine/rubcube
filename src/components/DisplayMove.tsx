import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { MoveHistory } from '../rubik/utils';
import RubikView from '../rubik/view';
import { Jump } from '../d';

type DisplayMoveProps = {
  moveHistory: MoveHistory[],
  jump: Jump,
  currentMove: number,
}

const DisplayMove = (props: DisplayMoveProps) => {
  const [value, setValue] = useState(props.currentMove.toString());
  const [correctValue, setCorrectValue] = useState(true);

  const handleChange = (e) => {
    const inputHistoryIndex = Number(e.target.value);

    if (!Number.isNaN(inputHistoryIndex)) {
      if (inputHistoryIndex >= 0 && inputHistoryIndex < props.moveHistory.length) {
        setCorrectValue(true);
        setValue(e.target.value);
        props.jump(inputHistoryIndex);
        return;
      }
    }
    setCorrectValue(false);
    setValue(e.target.value);
  };

  useEffect(() => {
    setValue(props.currentMove.toString());
  }, [props.currentMove]);

  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <div>
      <InputStyle correct={correctValue} type='text' value={value} onFocus={handleFocus} onChange={handleChange}></InputStyle>
      <SpanStyle>/{props.moveHistory.length}</SpanStyle>
      {/* <div style={{ color: correctValue ? 'white' : 'orange' }}>{correctValue ? 'Correct' : 'Wrong'}</div> */}
    </div>
  );
};

// const DivStyle = styled.div`

// `;

const InputStyle = styled.input`
  ${({ correct }) => {
    return correct ? 'background-color: transparent;' : 'background-color: orange;';
  }}
  width: 40%;
  height: 40%;
  font-size: 25;
  outline: none;
  color: white;
  text-align: right;
`;

const SpanStyle = styled.span`
  color: white;
  width: 40%;
  height: 40%;
  font-size: 25;
`;

export default DisplayMove;
