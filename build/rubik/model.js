"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var face_1 = require("./face");
var move_1 = require("./move");
var RubikModel = (function () {
    function RubikModel(sideLength) {
        var _this = this;
        this.colorHashes = [1, 10, 100, 1000, 10000, 100000];
        this.faceCases = [[], [], [], []];
        this.sideCases = [[], [], [], []];
        this.faceCornerCases = [[], [], [], []];
        this.sequenceHor = [utils_1.sides.f, utils_1.sides.l, utils_1.sides.b, utils_1.sides.r, utils_1.sides.f];
        this.sequenceVer = [utils_1.sides.u, utils_1.sides.b, utils_1.sides.d, utils_1.sides.f, utils_1.sides.u];
        this.sequenceDep = [utils_1.sides.l, utils_1.sides.u, utils_1.sides.r, utils_1.sides.d, utils_1.sides.l];
        this.sequenceHorRev = [utils_1.sides.r, utils_1.sides.b, utils_1.sides.l, utils_1.sides.f, utils_1.sides.r];
        this.sequenceVerRev = [utils_1.sides.f, utils_1.sides.d, utils_1.sides.b, utils_1.sides.u, utils_1.sides.f];
        this.sequenceDepRev = [utils_1.sides.d, utils_1.sides.r, utils_1.sides.u, utils_1.sides.l, utils_1.sides.d];
        this.generateFaceSideCases = function () {
            var leftFaceCases = [_this.f.l, _this.f.u, _this.f.r, _this.f.d];
            var leftSideCases = [utils_1.sides.l, utils_1.sides.u, utils_1.sides.r, utils_1.sides.d];
            var leftFaceCornerCases = [_this.f.ul, _this.f.ur, _this.f.dr, _this.f.dl];
            for (var i = 0; i < 4; i += 1) {
                for (var j = 0; j < 4; j += 1) {
                    _this.faceCases[i][j] = leftFaceCases[(j + i) % 4];
                    _this.sideCases[i][j] = leftSideCases[(j + i) % 4];
                    _this.faceCornerCases[i][j] = leftFaceCornerCases[(j + i) % 4];
                }
            }
        };
        this.generateRandomMoves = function (num, randomSlices) {
            if (randomSlices === void 0) { randomSlices = false; }
            function randomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
            var funcs = [
                _this.moves.D,
                _this.moves.U,
                _this.moves.F,
                _this.moves.B,
                _this.moves.L,
                _this.moves.R,
            ];
            if (randomSlices === true) {
                for (var i = 0; i < num; i += 1) {
                    var clockwise = randomInt(0, 1) === 0;
                    var slice = randomInt(0, Math.floor(_this.sideLength / 2) - 1);
                    funcs[randomInt(0, funcs.length - 1)](slice, clockwise);
                }
            }
            else {
                for (var i = 0; i < num; i += 1) {
                    var clockwise = randomInt(0, 1) === 0;
                    funcs[randomInt(0, funcs.length - 1)](0, clockwise);
                }
            }
        };
        this.regMove = function (m) {
            _this.moveHistory.push(m);
            m.rotate(true);
        };
        this.rotateVer = function (slice, clockwise, realMatrix) {
            if (realMatrix === void 0) { realMatrix = true; }
            _this.rotate(_this.posVer, clockwise ? _this.sequenceVerRev : _this.sequenceVer, slice, realMatrix);
            _this.rotateFaceReal(slice, utils_1.sides.l, utils_1.sides.r, clockwise ? _this.posCounter : _this.posClockwise, realMatrix);
        };
        this.rotateHor = function (slice, clockwise, realMatrix) {
            if (realMatrix === void 0) { realMatrix = true; }
            _this.rotate(_this.posHor, clockwise ? _this.sequenceHorRev : _this.sequenceHor, slice, realMatrix);
            _this.rotateFaceReal(slice, utils_1.sides.d, utils_1.sides.u, clockwise ? _this.posCounter : _this.posClockwise, realMatrix);
        };
        this.rotateDep = function (slice, clockwise, realMatrix) {
            if (realMatrix === void 0) { realMatrix = true; }
            _this.rotate(clockwise ? _this.posDepRev : _this.posDep, clockwise ? _this.sequenceDepRev : _this.sequenceDep, slice, realMatrix);
            _this.rotateFaceReal(slice, utils_1.sides.b, utils_1.sides.f, clockwise ? _this.posClockwise : _this.posCounter, realMatrix);
        };
        this.createInterface = function () {
            _this.interface = [
                [],
                [],
                [],
                [],
                [],
                [],
            ];
            var standard = [];
            for (var i = 0; i < _this.totalColors; i += 1) {
                standard.push(i);
            }
            var opposite = [];
            for (var i = _this.sideLength - 1; i < _this.totalColors; i += _this.sideLength) {
                for (var j = 0; j < _this.sideLength; j += 1) {
                    opposite.push(i - j);
                }
            }
            _this.stRotations = [
                standard,
                [],
                [],
                [],
            ];
            _this.opRotations = [
                opposite,
                [],
                [],
                [],
            ];
            for (var i = 0; i < 3; i += 1) {
                for (var j = 0; j < _this.totalColors; j += 1) {
                    _this.stRotations[i + 1].push(_this.stRotations[i][_this.posCounter[j]]);
                    _this.opRotations[i + 1].push(_this.opRotations[i][_this.posClockwise[j]]);
                }
            }
            _this.interface[utils_1.sides.l] = __spreadArrays(_this.stRotations[3]);
            _this.interface[utils_1.sides.r] = __spreadArrays(_this.opRotations[3]);
            _this.interface[utils_1.sides.u] = __spreadArrays(_this.opRotations[2]);
            _this.interface[utils_1.sides.d] = __spreadArrays(_this.stRotations[2]);
            _this.interface[utils_1.sides.f] = __spreadArrays(_this.stRotations[0]);
            _this.interface[utils_1.sides.b] = __spreadArrays(_this.stRotations[0]);
        };
        this.check = function (side, face, color) { return _this.getColor(side, face) === color; };
        this.getColor = function (side, direction) { return _this.matrix[side][_this.interface[side][direction]]; };
        this.getColorHash = function (side, direction) { return _this.colorHashes[_this.getColor(side, direction)]; };
        this.getCubesHor = function (slice) { return _this.getCubes(_this.posHor, _this.sequenceHor, slice, utils_1.sides.d, utils_1.sides.u); };
        this.getCubesVer = function (slice) { return _this.getCubes(_this.posVer, _this.sequenceVer, slice, utils_1.sides.l, utils_1.sides.r); };
        this.getCubesDep = function (slice) { return _this.getCubes(_this.posDep, _this.sequenceDep, slice, utils_1.sides.b, utils_1.sides.f); };
        this.createMatrix = function () {
            var totalColors = _this.sideLength * _this.sideLength;
            var matrixRubic = [];
            for (var i = 0; i < 6; i += 1) {
                var tempArr = [];
                for (var q = 0; q < totalColors; q += 1) {
                    tempArr.push(i);
                }
                matrixRubic.push(tempArr);
            }
            return matrixRubic;
        };
        this.createMatrixReference = function (cubes) {
            var matrixRubic = [
                [],
                [],
                [],
                [],
                [],
                [],
            ];
            for (var cube = 0; cube < _this.totalColors; cube += 1) {
                matrixRubic[utils_1.sides.d].push(cube);
            }
            for (var cube = cubes - _this.totalColors; cube < cubes; cube += 1) {
                matrixRubic[utils_1.sides.u].push(cube);
            }
            for (var cube = 0; cube < cubes; cube += _this.sideLength) {
                matrixRubic[utils_1.sides.l].push(cube);
            }
            for (var cube = _this.sideLength - 1; cube < cubes; cube += _this.sideLength) {
                matrixRubic[utils_1.sides.r].push(cube);
            }
            var lastSide = _this.sideLength * _this.sideLength - _this.sideLength;
            for (var slice = 0; slice < _this.sideLength; slice += 1) {
                var start = slice * _this.totalColors;
                var end = start + _this.sideLength;
                for (var cube = start; cube < end; cube += 1) {
                    matrixRubic[utils_1.sides.b].push(cube);
                    matrixRubic[utils_1.sides.f].push(cube + lastSide);
                }
            }
            return matrixRubic;
        };
        this.getCubes = function (slices, sequence, slice, bottom, top) {
            if (slice === 0) {
                return _this.matrixReference[bottom];
            }
            if (slice === _this.sideLength - 1) {
                return _this.matrixReference[top];
            }
            var cubes = [];
            var layer = slices[slice];
            for (var face = 0; face < layer.length; face += 1) {
                for (var i = 0; i < layer[face].length - 1; i += 1) {
                    cubes.push(_this.matrixReference[sequence[face]][layer[face][i]]);
                }
            }
            return cubes;
        };
        this.rotate = function (slices, sequence, slice, realMatrix) {
            var matrix = realMatrix ? _this.matrix : _this.matrixReference;
            var layer = slices[slice];
            var first = layer[0];
            var firstFace = layer[0].map(function (i) { return matrix[sequence[0]][i]; });
            for (var face = 0; face < layer.length - 1; face += 1) {
                var second = layer[face + 1];
                for (var i = 0; i < layer[face].length; i += 1) {
                    matrix[sequence[face]][first[i]] = matrix[sequence[face + 1]][second[i]];
                }
                first = second;
            }
            var lastFace = sequence[sequence.length - 2];
            for (var i = 0; i < layer[0].length; i += 1) {
                matrix[lastFace][layer[3][i]] = firstFace[i];
            }
        };
        this.rotateFaceReal = function (slice, bottom, top, clockwiseArr, realMatrix) {
            var matrix = realMatrix ? _this.matrix : _this.matrixReference;
            if (slice === 0) {
                _this.rotateFace(bottom, clockwiseArr, matrix);
            }
            else if (slice === _this.sideLength - 1) {
                _this.rotateFace(top, clockwiseArr, matrix);
            }
        };
        this.rotateFace = function (face, positionFace, matrix) {
            var faceCopy = __spreadArrays(matrix[face]);
            for (var i = 0; i < _this.totalColors; i += 1) {
                matrix[face][i] = faceCopy[positionFace[i]];
            }
        };
        this.generatePositions = function () {
            _this.posHor = _this.createEmptySlices();
            _this.posVer = _this.createEmptySlices();
            _this.posDep = _this.createEmptySlices();
            _this.posDepRev = _this.createEmptySlices();
            for (var slice = 0; slice < _this.posHor.length; slice += 1) {
                for (var m = 0; m < _this.sideLength; m += 1) {
                    _this.posHor[slice][0].push(slice * _this.sideLength + m);
                    _this.posHor[slice][1].push(slice * _this.sideLength + m);
                    _this.posVer[slice][0].push(slice + _this.sideLength * m);
                    _this.posVer[slice][1].push(slice + _this.sideLength * m);
                    _this.posDep[slice][0].push(slice + _this.sideLength * m);
                    _this.posDep[slice][1].push(slice * _this.sideLength + m);
                    _this.posDepRev[slice][0].push(slice * _this.sideLength + m);
                    _this.posDepRev[slice][1].push(slice + _this.sideLength * m);
                }
                var horCopy = __spreadArrays(_this.posHor[slice][0]).reverse();
                _this.posHor[slice][2] = horCopy;
                _this.posHor[slice][3] = horCopy;
                var verCopy = __spreadArrays(_this.posVer[slice][0]).reverse();
                _this.posVer[slice][2] = verCopy;
                _this.posVer[slice][3] = verCopy;
                var depCopyOne = __spreadArrays(_this.posDep[slice][0]).reverse();
                var depCopyTwo = __spreadArrays(_this.posDep[slice][1]).reverse();
                _this.posDep[slice][2] = depCopyOne;
                _this.posDep[slice][3] = depCopyTwo;
                var depRevCopyOne = __spreadArrays(_this.posDepRev[slice][0]).reverse();
                var depRevCopyTwo = __spreadArrays(_this.posDepRev[slice][1]).reverse();
                _this.posDepRev[slice][2] = depRevCopyOne;
                _this.posDepRev[slice][3] = depRevCopyTwo;
            }
            _this.posClockwise = [];
            _this.posCounter = [];
            for (var i = 0; i < _this.sideLength; i += 1) {
                for (var j = 0; j < _this.sideLength; j += 1) {
                    _this.posClockwise.push((_this.sideLength - i - 1) + j * _this.sideLength);
                    _this.posCounter.push(i + (_this.sideLength - 1 - j) * _this.sideLength);
                }
            }
        };
        this.sideLength = sideLength;
        this.totalColors = sideLength * sideLength;
        this.matrix = this.createMatrix();
        this.matrixReference = this.createMatrixReference(sideLength * sideLength * sideLength);
        this.generatePositions();
        this.createInterface();
        this.f = new face_1.default(sideLength);
        this.generateFaceSideCases();
        this.moveHistory = [];
        this.moves.L = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('L', 0 + slice, !clockwise, 'y', _this.rotateVer, _this.getCubesVer));
        };
        this.moves.R = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('R', _this.sideLength - 1 - slice, clockwise, 'y', _this.rotateVer, _this.getCubesVer));
        };
        this.moves.U = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('U', _this.sideLength - 1 - slice, clockwise, 'x', _this.rotateHor, _this.getCubesHor));
        };
        this.moves.D = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('D', 0 + slice, !clockwise, 'x', _this.rotateHor, _this.getCubesHor));
        };
        this.moves.F = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('F', _this.sideLength - 1 - slice, clockwise, 'z', _this.rotateDep, _this.getCubesDep));
        };
        this.moves.B = function (slice, clockwise) {
            if (slice === void 0) { slice = 0; }
            if (clockwise === void 0) { clockwise = true; }
            return _this.regMove(new move_1.default('B', 0 + slice, !clockwise, 'z', _this.rotateDep, _this.getCubesDep));
        };
    }
    RubikModel.prototype.createEmptySlices = function () {
        var slices = [];
        for (var i = 0; i < this.sideLength; i += 1) {
            var slice = [];
            for (var face = 0; face < 4; face += 1) {
                var faces = [];
                slice.push(faces);
            }
            slices.push(slice);
        }
        return slices;
    };
    return RubikModel;
}());
exports.default = RubikModel;
//# sourceMappingURL=model.js.map