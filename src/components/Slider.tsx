import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import RubikView from '../rubik/view';

type RubikProps = {
  rubik: RubikView,
}

const Slider = (props: RubikProps) => {
  const [speed, setSpeed] = useState(props.rubik.speed);

  const onInput = (e) => {
    const { value } = e.target;
    setSpeed(value);
  };

  useEffect(() => {
    props.rubik.speed = speed;
  }, [speed]);

  useEffect(() => {
    setSpeed(props.rubik.speed);
  }, [props.rubik]);

  return (
    <>
      <TextDisplay>Speed: {speed / 1000}</TextDisplay>
      <SliderStyle type='range' min='1' max='3000' value={speed} onInput={onInput} />
    </>
  );
};

const TextDisplay = styled.div`
  font-size: 30;
  text-align: center;
`;

const SliderStyle = styled.input`
  width: 100%;
`;

export default Slider;
