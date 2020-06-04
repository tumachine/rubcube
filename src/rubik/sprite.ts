/* eslint-disable max-classes-per-file */

import * as THREE from '../../node_modules/three/src/Three';
import RubikModel from './model';

export default class Sprite {
  private length: number

  private canvas: HTMLCanvasElement

  private context: CanvasRenderingContext2D

  private textures: THREE.Texture[]

  private cellLength: number

  public constructor(length: number) {
    this.length = length;

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.textures = new Array(length * length);
  }

  private getStartEnd = (direction: number): THREE.Vector2 => {
    const row = RubikModel.getRow(direction, this.length);
    const col = RubikModel.getColumn(direction, this.length);
    const startX = col * this.cellLength;
    const startY = row * this.cellLength;
    return new THREE.Vector2(startX, startY);
  }

  private createTextures = () => {
    for (let i = 0; i < this.length * this.length; i += 1) {
      this.createTexture(i);
    }
  }

  public setImage = (name: string, onComplete: Function) => {
    const img = new Image();
    img.src = require('../textures/pog-champ.png');

    img.onload = (e) => {
      const max = Math.max(img.width, img.height);
      this.cellLength = max / this.length;
      this.canvas.width = max;
      this.canvas.height = max;

      img.width = max;
      img.height = max;

      this.drawImage(img);

      try {
        localStorage.setItem('rubik-image', this.canvas.toDataURL('image/png'));
      } catch (err) {
        console.log(`Error: ${err}`);
      }
      this.createTextures();
      onComplete();
    };
  }

  public getTexture = (direction: number): THREE.Texture => this.textures[direction];

  public createTexture = (direction: number) => {
    const { x, y } = this.getStartEnd(direction);

    const imgData = this.context.getImageData(x, y, this.cellLength, this.cellLength);
    const texture = new THREE.DataTexture(imgData.data, this.cellLength, this.cellLength);
    texture.type = THREE.UnsignedByteType;
    texture.needsUpdate = true;
    // texture.flipY = true;
    this.textures[direction] = texture;
  }

  public fillSpriteWithDirections = () => {
    for (let i = 0; i < this.length * this.length; i += 1) {
      this.setTextOnSprite(i, i.toString());
      this.createTexture(i);
    }
  }

  private setTextOnSprite = (direction: number, text: string) => {
    this.cellLength = 256;
    this.canvas.width = this.cellLength * this.length;
    this.canvas.height = this.cellLength * this.length;

    this.context.font = `Bold ${this.cellLength / 2}px Arial`;
    this.context.fillStyle = 'rgba(0,0,0,0.95)';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    const { x, y } = this.getStartEnd(direction);
    this.context.fillText(text, x + this.cellLength / 2, y + this.cellLength / 2);
  }

  private drawImage(img, horizontal: boolean = false, vertical: boolean = false, x: number = 0, y: number = 0) {
    this.context.save();
    this.context.setTransform(
      horizontal ? -1 : 1, 0,
      0, vertical ? -1 : 1,
      x + horizontal ? img.width : 0,
      y + vertical ? img.height : 0,
    );
    this.context.drawImage(img, 0, 0);
    this.context.restore();
  }

  public dispose = () => {
    for (let i = 0; i < this.length * this.length; i += 1) {
      if (this.textures[i]) {
        this.textures[i].dispose();
      }
    }
  }
}
