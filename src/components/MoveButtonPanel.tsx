import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import RubikView from '../rubik/view';
import { Side, moveToString } from '../rubik/utils';

type RubikProps = {
  rubik: RubikView,
};

const MoveButtonPanel = (props: RubikProps) => {
  const [selectedSide, setSelectedSide] = useState(Side.l);
  const [moveButtons, setMoveButtons] = useState<JSX.Element[]>();

  const addButton = (side: number, slice: number, clockwise: boolean, width: number): JSX.Element => {
    const description = moveToString(side, slice, clockwise);
    const func = () => props.rubik.doMove(side, slice, clockwise);
    return (
      <MoveButton width={width} key={`${side}:${slice}:${clockwise}`} onClick={func}>{description}</MoveButton>
    );
  };

  const createSideMoveButtons = (side: number, clockwise: boolean): JSX.Element[] => {
    const buttons: JSX.Element[] = [];
    const amount = Math.floor(props.rubik.getLength() / 2);
    const width = Math.floor(100 / amount);
    for (let slice = 0; slice < amount; slice += 1) {
      buttons.push(addButton(side, slice, clockwise, width));
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

  useEffect(() => {
    setMoveButtons([]);
  }, [props.rubik]);

  return (
    <div>
      <Main>
        <MoveSelection onClick={() => setSelectedSide(Side.l)}>L</MoveSelection>
        <MoveSelection onClick={() => setSelectedSide(Side.r)}>R</MoveSelection>
        <MoveSelection onClick={() => setSelectedSide(Side.u)}>U</MoveSelection>
        <MoveSelection onClick={() => setSelectedSide(Side.d)}>D</MoveSelection>
        <MoveSelection onClick={() => setSelectedSide(Side.f)}>F</MoveSelection>
        <MoveSelection onClick={() => setSelectedSide(Side.b)}>B</MoveSelection>
      </Main>
      <div>{moveButtons}</div>
    </div>
  );
};

const MoveSelection = styled.button`
  width: 16%;
  background-color: #FF3333;
`;

const MoveButton = styled.button`
  width: ${(props) => props.width}%;
`;

const Main = styled.div`
  width: 100%;
`;

export default MoveButtonPanel;
