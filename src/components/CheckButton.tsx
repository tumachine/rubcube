import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface addRubik {
  (length: number): void;
}

type Props = {
  name: string,
  description: string,
  handleOn: Function,
  handleOff: Function,
}

const CheckButton = (props: Props) => {
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
    <label style={{color: 'white'}}>
    {props.description}
    <input
      name={props.name}
      type="checkbox"
      checked={checked}
      onChange={handleInputChange} />
    </label>
  );
};

export default CheckButton;
