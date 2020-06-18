import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { MoveHistory } from '../rubik/utils';
import RubikView from '../rubik/view';
import { Jump } from '../d';

type Props = {
  rubik: RubikView
}

const MoveTo = (props: Props) => {
  const [value, setValue] = useState(props.rubik.getCurrentHistoryIndex().toString());
  const [correctValue, setCorrectValue] = useState(true);

  const handleChange = (e) => {
    const inputHistoryIndex = Number(e.target.value);

    if (!Number.isNaN(inputHistoryIndex)) {
      if (inputHistoryIndex >= 0 && inputHistoryIndex < props.rubik.getHistory().length) {
        setCorrectValue(true);
        setValue(e.target.value);
        return;
      }
    }
    setCorrectValue(false);
    setValue(e.target.value);
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const onClick = (e) => {
    if (correctValue) {
      props.rubik.doMoves(Number(value));
    }
  };

  return (
    <>
      {/* <InputStyle correct={correctValue} type='text' value={value} onFocus={handleFocus} onChange={handleChange}></InputStyle> */}
      <InputStyle correct={correctValue} type='text' value={value} onFocus={handleFocus} onChange={handleChange}></InputStyle>
      <SpanStyle>/</SpanStyle>
      {/* <input type='text' value={value} onFocus={handleFocus} onChange={handleChange}></input>
      <StyledButton onClick={onClick} /> */}
    </>
  );
};

const InputStyle = styled.input`
  ${({ correct }) => (correct ? 'background-color: transparent;' : 'background-color: orange;')}}
  width: 50%;
  box-sizing: border-box;
  height: 40%;
  font-size: 25;
  outline: none;
  color: white;
  text-align: right;
`;

const StyledButton = styled.button`
  width: 50%; 
  height: 100%;
`;

const SpanStyle = styled.span`
  color: white;
  width: 50%;
  height: 40%;
  font-size: 25;
  display: inline-block;
  text-align: left;
`;

export default MoveTo;
