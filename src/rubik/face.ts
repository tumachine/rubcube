class Face {
  public d: number

  public dr: number

  public dl: number

  public m: number

  public r: number

  public l: number

  public u: number

  public ur: number

  public ul: number


  public constructor(sideLength: number) {
    const faceDown = 1;
    const faceDownRight = sideLength - 1;
    const faceDownLeft = 0;

    const faceMiddle = sideLength + 1;
    const faceMiddleRight = (sideLength * 2) - 1;
    const faceMiddleLeft = sideLength;

    const faceUp = (sideLength * sideLength) - sideLength + 1;
    const faceUpRight = (sideLength * sideLength) - 1;
    const faceUpLeft = (sideLength * sideLength) - sideLength;

    this.d = faceDown;
    this.dr = faceDownRight;
    this.dl = faceDownLeft;

    this.m = faceMiddle;
    this.r = faceMiddleRight;
    this.l = faceMiddleLeft;

    this.u = faceUp;
    this.ur = faceUpRight;
    this.ul = faceUpLeft;
  }
}

export default Face;
