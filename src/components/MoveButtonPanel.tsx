import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import RubikView from '../rubik/view';
import { Side, moveToString } from '../rubik/utils';

type RubikProps = {
  rubik: RubikView,
}

const MoveButtonPanel = (props: RubikProps) => {
  const [selectedSide, setSelectedSide] = useState(Side.l);
  const [moveButtons, setMoveButtons] = useState<JSX.Element[]>();

  const addButton = (side: number, slice: number, clockwise: boolean): JSX.Element => {
    const description = moveToString(side, slice, clockwise);
    const func = () => props.rubik.doMove(side, slice, clockwise);
    return (
      <button key={`${side}:${slice}:${clockwise}`} onClick={func}>{description}</button>
    );
  };

  const createSideMoveButtons = (side: number, clockwise: boolean): JSX.Element[] => {
    const buttons: JSX.Element[] = [];
    for (let slice = 0; slice < props.rubik.getLength() / 2; slice += 1) {
      buttons.push(addButton(side, slice, clockwise));
    }
    return buttons;
  };

  useEffect(() => {
    const buttons: JSX.Element[] = [];
    buttons.push(...createSideMoveButtons(selectedSide, true));
    buttons.push(<br key='break'></br>);
    buttons.push(...createSideMoveButtons(selectedSide, false));
    setMoveButtons(buttons);
  }, [selectedSide]);

  return (
    <div>
      <div>
        <button onClick={() => setSelectedSide(Side.l)}>Left</button>
        <button onClick={() => setSelectedSide(Side.r)}>Right</button>
        <button onClick={() => setSelectedSide(Side.u)}>Up</button>
        <button onClick={() => setSelectedSide(Side.d)}>Down</button>
        <button onClick={() => setSelectedSide(Side.f)}>Front</button>
        <button onClick={() => setSelectedSide(Side.b)}>Back</button>
      </div>
      <div>{moveButtons}</div>
    </div>
  );
};

export default MoveButtonPanel;
