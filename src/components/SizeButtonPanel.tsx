import React from 'react';
import ReactDOM from 'react-dom';
import RubikView from '../rubik/view';

interface addRubik {
  (length: number): void;
}

type RubikProps = {
  rubik: RubikView,
  addRubik: addRubik,
}

const SizeButtonPanel = (props: RubikProps) => {
  const rubikResize = (size: number) => {
    if (size >= 3) {
      props.addRubik(size);
    }
  };

  const length = props.rubik.getLength();

  return (
    <div>
      <div style={{ color: 'white', fontSize: 24 }}>Size:</div>
      <button onClick={() => rubikResize(length + 1)}>{'+'}</button>
      <div style={{ color: 'white', fontSize: 24 }}>{length}</div>
      <button onClick={() => rubikResize(length - 1)}>{'-'}</button>
    </div>
  );
};

export default SizeButtonPanel;
