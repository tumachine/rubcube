import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { MoveHistory, Side, moveToString } from '../rubik/utils';
import { Jump } from '../d';

type HistoryPanelProps = {
  history: MoveHistory[],
  currentMove: number,
  jump: Jump,
}

type HistoryButtonProps = {
  style: string,
  index: number,
  handleClick: (index: number) => void,
  active: boolean,
  move: MoveHistory,
}

const HistoryButton = ({ style, index, handleClick, active, move }: HistoryButtonProps) => {
  const getText = (): string => {
    let text = '';
    if (move !== null) {
      const { side, slice, clockwise } = move;
      const desc = moveToString(side, Number(slice), clockwise);
      text = `${index}: 
              ${desc}`;
    }
    return text;
  };

  return (
    <List style={style} index={index} active={active} onClick={() => handleClick(index)}>
        {getText()}
    </List>
  );
};

const HistoryPanel = (props: HistoryPanelProps) => {
  return (
    <AutoSizer>
    {({ height, width }) => (
      <UnorderedList itemCount={props.history.length} itemSize={20} width={width} height={height}>
        {({ index, style }) => <HistoryButton
          active={props.currentMove === index}
          handleClick={props.jump}
          move={props.history[index]}
          index={index}
          style={style}
          />}
      </UnorderedList>
    )}
    </AutoSizer>
  );
};

const UnorderedList = styled(FixedSizeList)`
  overflow: scroll;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;

  border: 2px solid #ccc;

  font-size: 16px;
  font-family: Arial, sans-serif;

  // Again, this is where the magic happens
  -webkit-overflow-scrolling: touch;
`;

const List = styled.li`
  border-bottom: 1px solid #ccc;

  ${(props) => {
    if (props.active === true) {
      return 'background: #6666FF;';
    }
    if (props.index % 2 === 0) {
      return 'background: white;';
    }
    return 'background: grey;';
  }}
  
`;

export default HistoryPanel;
