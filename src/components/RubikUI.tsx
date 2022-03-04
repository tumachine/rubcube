import React, {useState, useEffect, useRef} from 'react';
import styled, { css } from 'styled-components';
import RubikView from '../rubik/view';
import RotateButtonPanel from './RotateButtonPanel';
import SizeButtonPanel from './SizeButtonPanel';
import { CurrentMoveHistory } from '../rubik/move';
import DisplayMove from './DisplayMove';
import MoveButtonPanel from './MoveButtonPanel';
import HistoryPanel from './HistoryPanel';
import CheckButtonPanel from './CheckButtonPanel';
import DrawPanel from './DrawPanel';
import StandardButtons from './StandardButtons';
import Slider from './Slider';
import MoveTo from './MoveTo';

interface setRubik {
  (length: number): void;
}

type RubikProps = {
  rubik: RubikView,
  setRubik: setRubik,
}

const base = css`
  font-family: 'Teko', sans-serif;
  position: absolute;
  text-transform: uppercase;
  font-weight: 900;
  font-variant-numeric: slashed-zero tabular-nums;
  pointer-events: none;
  color: indianred;
`;

const TopLeft = styled.div`
  ${base};
  top: 5%;
  left: 5%;
  width: 15%;
  height: 60%;
  font-size: 2em;
  pointer-events: all;
  cursor: pointer;
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`;

const BotMiddle = styled.div`
  ${base};
  bottom: 5%;
  left: 30%;
  pointer-events: all;
  width: 40%;
  height: 10%;
`;

const TopRight = styled.div`
  ${base};
  text-align: right;
  width: 15%;
  top: 5%;
  right: 5%;
  font-size: 2em;
  pointer-events: all;
  cursor: pointer;
  & > a {
    color: indianred;
    text-decoration: none;
  }
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`;

const RubikUI = (props: RubikProps) => {
  const [currentMove, setCurrentMove] = useState(props.rubik.getCurrentHistoryIndex());
  const [history, setHistory] = useState(props.rubik.getHistory());

  const drawOperations = useRef({
    none: () => props.rubik.disposeImages(),
    image: () => props.rubik.drawImages(),
    numbers: () => props.rubik.drawText(),
  });

  useEffect(() => {
    props.rubik.newMoveHandler = () => {
      setHistory(props.rubik.getHistory());
    };

    props.rubik.moveCompleteHandler = (move: CurrentMoveHistory) => {
      if (move.index !== -1) {
        setCurrentMove(move.index);
      }
    };

    setHistory(props.rubik.getHistory());
    setCurrentMove(props.rubik.getCurrentHistoryIndex());

    drawOperations.current = {
      none: () => props.rubik.disposeImages(),
      image: () => props.rubik.drawImages(),
      numbers: () => props.rubik.drawText(),
    };
  }, [props.rubik]);

  const jump = (index: number) => {
    setCurrentMove(index);
    props.rubik.jump(index);
  };

  return (
    <>
      <TopRight>
        <SizeButtonPanel rubik={props.rubik} addRubik={props.setRubik} />
        <DisplayMove
          moveHistory={history}
          currentMove={currentMove}
          jump={jump}
        />
        <RotateButtonPanel rubik={props.rubik} />
        <MoveButtonPanel rubik={props.rubik} />
        <CheckButtonPanel rubik={props.rubik} />
        <DrawPanel drawOperations={drawOperations.current} />
        <Slider rubik={props.rubik} />
        <MoveTo rubik={props.rubik} />
      </TopRight>
      <BotMiddle>
        <StandardButtons rubik={props.rubik} />
      </BotMiddle>
      <TopLeft>
        <HistoryPanel history={history} currentMove={currentMove} jump={jump}/>
      </TopLeft>
    </>
  );
};

export default RubikUI;
