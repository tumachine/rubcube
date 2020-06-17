import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import RubikView from '../rubik/view';
import RadioButton from './RadioButton';

type Props = {
  drawOperations: Object,
}

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
    <form onSubmit={handleFormSubmit}>
      { Object.entries(props.drawOperations).map((i) => <RadioButton
            key={i[0]}
            value={i[0]}
            selectedOption={selected}
            handleOptionChange={handleOptionChange}
        />)
      }
      <button type='submit'>Draw</button>
    </form>
  );
};

export default DrawPanel;
