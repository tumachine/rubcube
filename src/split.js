// Three.js - Responsive Editor
// from https://threejsfundamentals.org/threejs/threejs-responsive-editor.html

import Split from './lib/split/split';

/* global Split */

// This code is only related to handling the split.
// Our three.js code has not changed
Split(['#view', '#controls'], { // eslint-disable-line new-cap
  sizes: [75, 25],
  minSize: 100,
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`,
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`,
  }),
});
