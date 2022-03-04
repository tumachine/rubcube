import React from 'react';
import styled from 'styled-components';

interface onChange {
  (event: React.ChangeEvent<HTMLInputElement>): void;
}
type Props = {
  value: string,
  selectedOption: string
  handleOptionChange: onChange
}

const RadioButton = (props: Props) => {
  return (
    <StyleLabel>
      <StyleInput type="radio" value={props.value} checked={props.selectedOption === props.value} onChange={props.handleOptionChange} />
        {props.value}
    </StyleLabel>
  );
};

const StyleLabel = styled.label`
  display: block;
  text-align: center;
  font-size: 12px;
  width: 100%;
`;

const StyleInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  color: white;
`;

export default RadioButton;
