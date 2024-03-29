import React from 'react';
import Scene from './components/Scene';
import { createGlobalStyle } from 'styled-components';

const GlobalCSS = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    user-select: none;
  }

  body {
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif;
    color: black;
    background: white;
  }
`;

const App = () => (
  <>
    <GlobalCSS />
    <Scene />;
  </>
)

export default App;
