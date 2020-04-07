"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Face = (function () {
    function Face(sideLength) {
        var faceDown = 1;
        var faceDownRight = sideLength - 1;
        var faceDownLeft = 0;
        var faceMiddle = sideLength + 1;
        var faceMiddleRight = (sideLength * 2) - 1;
        var faceMiddleLeft = sideLength;
        var faceUp = (sideLength * sideLength) - sideLength + 1;
        var faceUpRight = (sideLength * sideLength) - 1;
        var faceUpLeft = (sideLength * sideLength) - sideLength;
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
    return Face;
}());
exports.default = Face;
//# sourceMappingURL=face.js.map