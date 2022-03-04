import React, { useState } from 'react';
import styled from 'styled-components';
import RadioButton from './RadioButton';

type Props = {
  drawOperations: Record<string, () => void>,
}

const StyledButton = styled.button`
  width: 100%; 
`;

const Border = styled.div`
  width: 100%; 
  border-color: grey;
  border-style: solid;
`;

const DrawPanel = (props: Props) => {
  const [selected, setSelected] = useState('none');

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    props.drawOperations[selected]();
  };

  return (
    <Border>
      <form onSubmit={handleFormSubmit}>
        { Object.entries(props.drawOperations).map((i) => <RadioButton
              key={i[0]}
              value={i[0]}
              selectedOption={selected}
              handleOptionChange={handleOptionChange}
          />)
        }
        <StyledButton type='submit'>Draw</StyledButton>
      </form>
    </Border>
  );
};

export default DrawPanel;
