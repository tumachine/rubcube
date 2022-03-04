import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Jump, MoveHistory, moveToString } from '../rubik/utils';

type HistoryPanelProps = {
  history: MoveHistory[],
  currentMove: number,
  jump: Jump,
}

type HistoryButtonProps = {
  style: CSSProperties,
  index: number,
  handleClick: (index: number) => void,
  active: boolean,
  move: MoveHistory,
}

const UnorderedList = styled(FixedSizeList)`
  overflow: scroll;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;

  opacity: 70%;

  border: 2px solid #ccc;

  font-size: 12px;
  font-family: Arial, sans-serif;

  list-style-type: none;

  -webkit-overflow-scrolling: touch;
`;

const List = styled.li<{ active: boolean, index: number, style: CSSProperties }>`
  border-bottom: 1px solid #ccc;
  text-align: center;
  font-weight: 800;
  color: black;

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

const HistoryButton = ({
  style, index, handleClick, active, move,
}: HistoryButtonProps) => {
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

const HistoryPanel = (props: HistoryPanelProps) => (
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

export default HistoryPanel;
