import React from 'react';
import ReactDOM from 'react-dom';

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
    <label style={{color: 'white'}}>
      <input type="radio" value={props.value} checked={props.selectedOption === props.value} onChange={props.handleOptionChange} />
        {props.value}
    </label>
  );
};

export default RadioButton;
