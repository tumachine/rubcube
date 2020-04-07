/* eslint-disable max-len */
import * as THREE from '../../node_modules/three/src/Three';

export enum sides {
  l = 0,

  r = 1,

  u = 2,

  d = 3,

  f = 4,

  b = 5,
}


export enum colors {
  green = 0,

  blue = 1,

  orange = 2,

  red = 3,

  white = 4,

  yellow = 5,
}

// function roundRect(ctx, x, y, w, h, r) {
//   ctx.beginPath();
//   ctx.moveTo(x + r, y);
//   ctx.lineTo(x + w - r, y);
//   ctx.quadraticCurveTo(x + w, y, x + w, y + r);
//   ctx.lineTo(x + w, y + h - r);
//   ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
//   ctx.lineTo(x + r, y + h);
//   ctx.quadraticCurveTo(x, y + h, x, y + h - r);
//   ctx.lineTo(x, y + r);
//   ctx.quadraticCurveTo(x, y, x + r, y);
//   ctx.closePath();
//   ctx.fill();
//   ctx.stroke(); }

// export function makeTextSprite(message: string): THREE.Sprite {
//   const fontface = 'Arial';
//   const fontsize = 18;
//   const borderThickness = 4;
//   const borderColor = {
//     r: 0, g: 0, b: 0, a: 1.0,
//   };
//   const backgroundColor = {
//     r: 255, g: 255, b: 255, a: 1.0,
//   };
//   const textColor = {
//     r: 0, g: 0, b: 0, a: 1.0,
//   };

//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');
//   context.font = `Bold ${fontsize}px ${fontface}`;
//   const metrics = context.measureText(message);
//   const textWidth = metrics.width;

//   context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
//   context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;

//   context.lineWidth = borderThickness;
//   roundRect(context, borderThickness / 2, borderThickness / 2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);


//   context.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, 1.0)`;
//   context.fillText(message, borderThickness, fontsize + borderThickness);

//   const texture = new THREE.Texture(canvas);
//   texture.needsUpdate = true;

//   // const spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
//   const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
//   const sprite = new THREE.Sprite(spriteMaterial);
//   sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
//   return sprite;
// }
