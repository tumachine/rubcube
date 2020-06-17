import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import RubikView from '../rubik/view';
import { MoveHistory } from '../rubik/utils';
import { addObject, removeObject } from '../d';
import RotateButtonPanel from './RotateButtonPanel';
import './RubikUI.css';
import SizeButtonPanel from './SizeButtonPanel';
import { CurrentMoveHistory } from '../rubik/move';
import DisplayMove from './DisplayMove';
import MoveButtonPanel from './MoveButtonPanel';
import HistoryPanel from './HistoryPanel';
import CheckButtonPanel from './CheckButtonPanel';
import DrawPanel from './DrawPanel';
import StandardButtons from './StandardButtons';

type RubikState = {
  size: number,
  surround: boolean,
  numbers: boolean,
  image: boolean,
  currentMove: number;
  history: MoveHistory[]
}

interface setRubik {
  (length: number): void;
}

type RubikProps = {
  rubik: RubikView,
  setRubik: setRubik,
}


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
  }, [props.rubik]);

  const jump = (index: number) => {
    setCurrentMove(index);
    props.rubik.jump(index);
  };

  return (
    <div id="hud">
      <div className='top-right grid-border'>
        <SizeButtonPanel rubik={props.rubik} addRubik={props.setRubik} />
      <div className='bottom-left grid-border'>
        <DisplayMove
          moveHistory={history}
          currentMove={currentMove}
          jump={jump}
        />
      </div>
        <RotateButtonPanel rubik={props.rubik} />
      </div>
      <div className='top-left grid-border'>
        <MoveButtonPanel rubik={props.rubik} />
      </div>
      <div className='left grid-border'>
        <HistoryPanel history={history} currentMove={currentMove} jump={jump}/>
      </div>
      <div className='bottom-right grid-border'>
        <CheckButtonPanel rubik={props.rubik} />
        <DrawPanel drawOperations={drawOperations.current} />
      </div>
      <div className='bottom grid-border'>
        <StandardButtons rubik={props.rubik} />
      </div>
    </div>
  );
};

export default RubikUI;
