import React from 'react';
import ReactDOM from 'react-dom';
import CheckButton from './CheckButton';
import RubikView from '../rubik/view';

type Props = {
  rubik: RubikView,
}

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

export default CheckButtonPanel;
