import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import RubikView from '../rubik/view';

type Props = {
  rubik: RubikView,
}

interface addRubik {
  (length: number): void;
}

type CheckButtonProps = {
  name: string,
  description: string,
  handleOn: Function,
  handleOff: Function,
}

const CheckButton = (props: CheckButtonProps) => {
  const [checked, setChecked] = useState(false);

  const handleInputChange = (e) => {
    if (checked) {
      props.handleOff();
    } else {
      props.handleOn();
    }
    setChecked(!checked);
  };

  return (
    <StyleLabel>
    {props.description}
    <input
      name={props.name}
      type="checkbox"
      checked={checked}
      onChange={handleInputChange} />
    </StyleLabel>
  );
};

const CheckButtonPanel = (props: Props) => {
  return (
    <form>
      <CheckButton
        name='meshes'
        description='Change outer'
        handleOn={() => {
          props.rubik.enableOuter();
        }}
        handleOff={() => {
          props.rubik.disposeOuter();
        }}
      />
    </form>
  );
};

const StyleLabel = styled.label`
  font-size: 12px;
`;

export default CheckButtonPanel;
