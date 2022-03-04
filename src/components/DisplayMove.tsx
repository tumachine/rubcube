import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import styled from 'styled-components';
import { Jump, MoveHistory } from '../rubik/utils';

const InputStyle = styled.input<{ correct: boolean }>`
  ${({ correct }) => (correct ? 'background-color: transparent;' : 'background-color: orange;')};
  width: 50%;
  box-sizing: border-box;
  height: 40%;
  font-size: 25px;
  outline: none;
  color: white;
  text-align: right;
`;

const SpanStyle = styled.span`
  color: white;
  width: 50%;
  height: 40%;
  font-size: 25px;
  display: inline-block;
  text-align: left;
`;

type DisplayMoveProps = {
  moveHistory: MoveHistory[],
  jump: Jump,
  currentMove: number,
}

const DisplayMove = (props: DisplayMoveProps) => {
  const [value, setValue] = useState(props.currentMove.toString());
  const [correctValue, setCorrectValue] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target?.select();
  };

  return (
    <>
      <InputStyle correct={correctValue} type='text' value={value} onFocus={handleFocus} onChange={handleChange} />
      <SpanStyle>/{props.moveHistory.length - 1}</SpanStyle>
    </>
  );
};

export default DisplayMove;
