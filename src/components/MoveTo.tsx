import React, { useState } from 'react';
import styled from 'styled-components';
import RubikView from '../rubik/view';

type Props = {
  rubik: RubikView
}

const Main = styled.div`
  width: 100%; 
  height: 100%;
`;

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

const StyledButton = styled.input`
  width: 50%;
  height: 40%;
  font-size: 25px;
  display: inline-block;
`;


const MoveTo = (props: Props) => {
  const [value, setValue] = useState(props.rubik.getCurrentHistoryIndex().toString());
  const [correctValue, setCorrectValue] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const onClick = (e: React.MouseEvent) => {
    if (correctValue) {
      props.rubik.doMoves(Number(value));
    }
  };

  return (
    <Main>
      <InputStyle correct={correctValue} type='text' value={value} onFocus={handleFocus} onChange={handleChange} />
      <StyledButton type='button' onClick={onClick} value='GO' />
    </Main>
  );
};

export default MoveTo;
