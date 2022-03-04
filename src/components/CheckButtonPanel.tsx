import React, { useState } from 'react';
import styled from 'styled-components';
import RubikView from '../rubik/view';

type Props = {
  rubik: RubikView,
}

const StyleLabel = styled.label`
  font-size: 12px;
`;

type CheckButtonProps = {
  name: string,
  description: string,
  handleOn: Function,
  handleOff: Function,
}

const CheckButton = (props: CheckButtonProps) => {
  const [checked, setChecked] = useState(false);

  const handleInputChange = () => {
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

const CheckButtonPanel = (props: Props) => (
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

export default CheckButtonPanel;
