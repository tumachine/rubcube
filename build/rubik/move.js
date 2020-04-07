"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Move = (function () {
    function Move(side, slice, clockwise, axis, rotation, cubeGetter) {
        this.side = side;
        this.slice = slice;
        this.clockwise = clockwise;
        this.axis = axis;
        this.rotation = rotation;
        this.cubeGetter = cubeGetter;
    }
    Move.prototype.rotate = function (realMatrix) {
        this.rotation(this.slice, this.clockwise, realMatrix);
    };
    Move.prototype.getCubes = function () {
        return this.cubeGetter(this.slice);
    };
    return Move;
}());
exports.default = Move;
//# sourceMappingURL=move.js.map