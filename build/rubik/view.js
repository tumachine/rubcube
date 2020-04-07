"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("../../node_modules/three/src/Three");
var cube_1 = require("./cube");
var utils_1 = require("./utils");
var RubikView = (function () {
    function RubikView(rubikModel) {
        var _this = this;
        this.startNextMove = function () {
            _this.currentMove = _this.moveQueue[_this.moveN];
            if (_this.currentMove) {
                if (!_this.isMoving) {
                    _this.isMoving = true;
                    _this.moveDirection = _this.currentMove.clockwise ? -1 : 1;
                    (_this.currentMove.getCubes()).forEach(function (i) { return _this.activeGroup.push(_this.cubes[i].cube); });
                    _this.pivot.rotation.set(0, 0, 0);
                    _this.pivot.updateMatrixWorld();
                    _this.rubik.add(_this.pivot);
                    _this.activeGroup.forEach(function (e) {
                        _this.pivot.attach(e);
                    });
                    _this.determineAxis();
                }
                else {
                    console.log('Already moving!');
                }
            }
            else {
                console.log('NOTHING');
            }
        };
        this.doMove = function () {
            var axisValue = _this.focusedAxisValue;
            if (_this.focusedAxisValue >= Math.PI / 2) {
                axisValue = Math.PI / 2;
                _this.moveComplete();
            }
            else if (_this.focusedAxisValue <= Math.PI / -2) {
                axisValue = Math.PI / -2;
                _this.moveComplete();
            }
            else {
                _this.focusedAxisValue += (_this.moveDirection * _this.rotationSpeed);
            }
            _this.focusedAxisMethod(axisValue);
        };
        this.moveComplete = function () {
            _this.isMoving = false;
            _this.pivot.updateMatrixWorld();
            _this.rubik.remove(_this.pivot);
            _this.activeGroup.forEach(function (cube) {
                cube.updateMatrixWorld();
                _this.rubik.attach(cube);
            });
            _this.currentMove.rotate(false);
            _this.moveDirection = undefined;
            _this.moveN += 1;
            _this.startNextMove();
        };
        this.render = function () {
            if (_this.isMoving) {
                _this.doMove();
            }
        };
        this.createGraphicRubik = function () {
            var cubes = [];
            var limit = Math.floor(_this.rubikModel.sideLength / 2);
            if (_this.rubikModel.sideLength % 2 === 0) {
                limit = _this.rubikModel.sideLength / 2 - 0.5;
            }
            for (var y = -limit; y <= limit; y += 1) {
                for (var z = -limit; z <= limit; z += 1) {
                    for (var x = -limit; x <= limit; x += 1) {
                        if (y === -limit || y === limit || z === -limit || z === limit || x === -limit || x === limit) {
                            var cube = new cube_1.default(x, y, z);
                            cubes.push(cube);
                        }
                        else {
                            cubes.push(null);
                        }
                    }
                }
            }
            return cubes;
        };
        this.colorizeRubik = function () {
            var faceSides = {
                left: 0,
                right: 2,
                top: 4,
                bottom: 6,
                front: 8,
                back: 10,
            };
            for (var cube = 0; cube < _this.rubikModel.totalColors; cube += 1) {
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.d][cube]].setColor(faceSides.bottom, _this.rubikModel.matrix[utils_1.sides.d][cube]);
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.u][cube]].setColor(faceSides.top, _this.rubikModel.matrix[utils_1.sides.u][cube]);
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.l][cube]].setColor(faceSides.right, _this.rubikModel.matrix[utils_1.sides.l][cube]);
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.r][cube]].setColor(faceSides.left, _this.rubikModel.matrix[utils_1.sides.r][cube]);
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.f][cube]].setColor(faceSides.front, _this.rubikModel.matrix[utils_1.sides.f][cube]);
                _this.cubes[_this.rubikModel.matrixReference[utils_1.sides.b][cube]].setColor(faceSides.back, _this.rubikModel.matrix[utils_1.sides.b][cube]);
            }
        };
        this.rubikModel = rubikModel;
        this.rubik = new THREE.Object3D();
        this.cubes = this.createGraphicRubik();
        this.cubes.map(function (cube) { return (cube ? _this.rubik.add(cube.getCube()) : null); });
        this.moveQueue = [];
        this.moveN = 0;
        this.currentMove = null;
        this.isMoving = false;
        this.moveDirection = null;
        this.rotationSpeed = 0.2;
        this.pivot = new THREE.Object3D();
        this.activeGroup = [];
    }
    RubikView.prototype.determineAxis = function () {
        if (this.currentMove.axis === 'x') {
            this.focusedAxisMethod = this.pivot.rotateX;
            this.focusedAxisValue = this.pivot.rotation.x;
        }
        else if (this.currentMove.axis === 'y') {
            this.focusedAxisMethod = this.pivot.rotateY;
            this.focusedAxisValue = this.pivot.rotation.y;
        }
        else if (this.currentMove.axis === 'z') {
            this.focusedAxisMethod = this.pivot.rotateZ;
            this.focusedAxisValue = this.pivot.rotation.x;
        }
    };
    return RubikView;
}());
exports.default = RubikView;
//# sourceMappingURL=view.js.map